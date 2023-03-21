import json from "../assets/pizzasList.json";

export default {
  async fetch(request) {
    return new Response(JSON.stringify(json, null, 2), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  },
};
