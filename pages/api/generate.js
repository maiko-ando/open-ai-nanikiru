/** @format */

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const tiles = req.body.tiles || "";
  const kami = req.body.kamiDiscards || "";
  const simo = req.body.simoDiscards || "";
  const toi = req.body.toiDiscards || "";
  if (tiles.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid tiles",
      },
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(tiles, kami, simo, toi),
      temperature: 0.6,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(tile, kami, simo, toi) {
  return `麻雀において、自分の手牌がこのような形となっています。
  ${tile}

  ${kami ? "上家の捨て牌は" + kami : ""}
  ${toi ? "対面の捨て牌は" + toi : ""}
  ${simo ? "下家の捨て牌は" + simo : ""}
  この状態の時どの牌を切れば最も和了に近づくと考えられるか1つだけ選択して、その牌を回答してください。回答は牌を表すunicode1文字のみで回答してください。
  `;
}
