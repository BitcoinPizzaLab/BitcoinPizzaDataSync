const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const pizzasList = require("../assets/pizzasList.json");

const lowestOffsetNum = 599580;
let currentOffsetNum = lowestOffsetNum;

const ORD_URL = "https://ordapi.xyz";
const TURBO_ORD_URL = 'https://turbo.ordinalswallet.com'
let storage = { ...pizzasList };

if (!storage.latestOffset) {
  storage.latestOffset = lowestOffsetNum;
}

async function getInscriptions({ offset }) {
  const res = await axios.get(`${ORD_URL}/inscriptions`, {
    params: {
      start: offset,
      end: offset + 100,
      limit: 100,
    },
  });
  return res.data;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getLatestInscriptionNum = async () => {
  const latestInscriptions = await axios.get(`${TURBO_ORD_URL}/inscriptions`);
  const topInscriptionNum = latestInscriptions.data[0].num;
  console.log(`Top inscriptionNum is ${topInscriptionNum}`);
  return topInscriptionNum;
};

async function processBatch(inscriptions) {
  const imageInscriptions = inscriptions.filter(
    (it) => it.content_type === "image/png"
  );

  const promises = imageInscriptions.map(async (it) => {
    const res = await axios.get(`${TURBO_ORD_URL}/inscription/content/${it.id}`, {
      responseType: "arraybuffer",
    });
    const hash = crypto.createHash("md5").update(res.data).digest("hex");

    return {
      hash,
      inscription: {
        id: it.id,
        num: it.title.split(' ')[1],
      },
    };
  });

  const results = await Promise.all(promises);
  for (const result of results) {
    const { id, num } = result.inscription;
    const hash = result.hash;
    if (hash === "") return;
    if (storage.list[hash]) {
      if (!storage.list[hash].hashes[num]) {
        storage.list[hash].hashes[num] = id;

        const numList = Object.keys(storage.list[hash].hashes).map((t) =>
          Number(t)
        );
        const lowest = Math.min(...numList);
        storage.list[hash].lowest = lowest;

        fs.writeFileSync(
          "./assets/pizzasList.json",
          JSON.stringify(storage, null, 2)
        );
      }
    }
  }
}

async function run() {
  const latestInscriptionNum = await getLatestInscriptionNum();
  while (currentOffsetNum <= latestInscriptionNum) {
    const nextInscriptions = await getInscriptions({
      offset: currentOffsetNum,
    });
    console.log(currentOffsetNum);

    try {
      await processBatch(nextInscriptions);
      currentOffsetNum += 100;
    } catch (err) {
      console.log(err);
      await delay(2000);
      continue;
    }

    if (nextInscriptions.length < 100) break;
  }
}

run();
