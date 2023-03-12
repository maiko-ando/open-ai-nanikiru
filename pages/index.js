/** @format */

import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState();
  const [handTiles, setHandTiles] = useState([]);
  const [target, setTarget] = useState("自家");
  // 他家の捨て牌
  const [kamiDiscardedTiles, setKamiDiscardedTiles] = useState([]);
  const [toiDiscardedTiles, setToiDiscardedTiles] = useState([]);
  const [simoDiscardedTiles, setSimoDiscardedTiles] = useState([]);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setResult("");
      const tiles = handTiles.join("").replace(/\s/g, "");
      const kamiDiscards = kamiDiscardedTiles.join("").replace(/\s/g, "");
      const simoDiscards = simoDiscardedTiles.join("").replace(/\s/g, "");
      const toiDiscards = toiDiscardedTiles.join("").replace(/\s/g, "");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tiles, kamiDiscards, simoDiscards, toiDiscards }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  function tileButtons() {
    const tiles = ["🀀", "🀁", "🀂", "🀃", "🀆", "🀅", "🀄", "🀇", "🀈", "🀉", "🀊", "🀋", "🀌", "🀍", "🀎", "🀏", "🀐", "🀑", "🀒", "🀓", "🀔", "🀕", "🀖", "🀗", "🀘", "🀙", "🀚", "🀛", "🀜", "🀝", "🀞", "🀟", "🀠", "🀡"];
    const itemList = tiles.map((tile, index) => (
      <button
        key={index}
        className="tile text-2xl hover:bg-orange-300"
        onClick={(e) => {
          if (target === "自家") {
            if (handTiles.length >= 14) {
              alert("牌を14個以上選択できません");
              return;
            }
            setHandTiles([...handTiles, tile]);
          } else {
            switch (target) {
              case "自家":
                if (handTiles.length >= 14) {
                  alert("牌を14個以上選択できません");
                  return;
                }
                setHandTiles([...handTiles, tile]);
                break;
              case "上家":
                setKamiDiscardedTiles([...kamiDiscardedTiles, tile]);
                break;
              case "対面":
                setToiDiscardedTiles([...toiDiscardedTiles, tile]);
                break;
              case "下家":
                setSimoDiscardedTiles([...simoDiscardedTiles, tile]);
                break;
              default:
                break;
            }
          }
        }}
      >
        {tile}
      </button>
    ));
    return <div className="flex flex-row items-center justify-center flex-wrap gap-1">{itemList}</div>;
  }

  function handTileButtons() {
    const removeHandTile = (index) => {
      const newItems = [...handTiles];
      newItems.splice(index, 1);
      setHandTiles(newItems);
    };
    const itemList = handTiles.map((tile, index) => (
      <button
        key={index}
        className="hover:bg-red-400"
        onClick={(e) => {
          removeHandTile(index);
        }}
      >
        {tile}
      </button>
    ));
    return <div className="flex flex-row flex-wrap">{itemList}</div>;
  }

  function resultTile() {
    if (!result) return;
    return (
      <div className="py-4 bg-white text-3xl font-bold text-center">
        <p className="">あなたが切るべきなのは</p>
        <p className="my-3 text-6xl">{result}</p>
        <p className="">です！！！！！！</p>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>最強麻雀列伝</title>
      </Head>

      <main className="flex flex-col h-screen bg-green-800 p-2">
        <h3 className="text-center text-white text-4xl font-bold my-3">何切るAI</h3>
        <div className="bg-slate-50 p-2 text-center rounded-sm mb-2">
          <label className="text-xs text-orange-400">牌を選択</label>
          {tileButtons()}
        </div>
        <div className=" rounded-sm bg-slate-50 py-4">
          <div className="flex items-center justify-center w-full">
            <div onClick={(e) => setTarget("対面")} className="w-1/3 text-center cursor-pointer">
              <p className="text-xs mb-1">対面 捨て牌</p>
              <div className={"tiles " + (target === "対面" ? "active" : "")}>{toiDiscardedTiles}</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div onClick={(e) => setTarget("上家")} className="w-1/3 text-center cursor-pointer">
              <p className="text-xs mb-1">上家 捨て牌</p>
              <div className={"tiles " + (target === "上家" ? "active" : "")}>{kamiDiscardedTiles}</div>
            </div>
            <div onClick={(e) => setTarget("下家")} className="w-1/3 text-center cursor-pointer">
              <p className="text-xs mb-1">下家 捨て牌</p>
              <div className={"tiles " + (target === "下家" ? "active" : "")}>{simoDiscardedTiles}</div>
            </div>
          </div>
          <div className="flex items-center justify-center w-full">
            <div onClick={(e) => setTarget("自家")} className="w-1/3 text-center cursor-pointer">
              <p className="text-xs mb-1">あなたの手牌</p>
              <div className={"tiles " + (target === "自家" ? "active" : "")}>{handTileButtons()}</div>
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <input type="submit" className="w-full rounded-xl my-2 font-bold text-white bg-orange-400 p-2" value="何切ればいい？" />
        </form>
        {resultTile()}
      </main>
    </div>
  );
}
