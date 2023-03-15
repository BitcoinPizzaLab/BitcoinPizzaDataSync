const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

const lowestOffsetNum = 471913;
let latestOffset = 0;
const ORD_URL = "https://turbo.ordinalswallet.com";

async function getInscriptions({ offset }) {
  const res = await axios.get(`${ORD_URL}/inscriptions`, {
    params: {
      offset,
    },
  });
  return res.data;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const inscriptions = await getInscriptions({ offset: undefined });
  const topInscriptionNum = inscriptions[0].num;
  const searchOffset = topInscriptionNum - lowestOffsetNum;
  let currentInscriptionNum = searchOffset;

  console.log(`Top inscriptionNum is ${topInscriptionNum}`);

  while (currentInscriptionNum <= lowestOffsetNum) {
    let nextInscriptions;
    console.log(currentInscriptionNum);
    try {
      nextInscriptions = await getInscriptions({
        offset: latestOffset,
      });
      latestOffset += nextInscriptions.length + 100;
      currentInscriptionNum = nextInscriptions[0].num;
    } catch (err) {
      console.log(err);
      await delay(2000);
      continue;
    }

    if (nextInscriptions.length === 0) {
      break;
    }
  }
}

run();
