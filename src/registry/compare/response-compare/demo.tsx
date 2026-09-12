import { ResponseCompare, type CompareResponse } from "./component";

const responses: [CompareResponse, CompareResponse] = [
  {
    id: "a",
    label: "Response A",
    content:
      "Photosynthesis is the process plants use to convert light energy into chemical energy. Chlorophyll in the leaves absorbs sunlight, which drives a reaction that turns water and carbon dioxide into glucose and oxygen. The glucose fuels the plant's growth, and the oxygen is released as a byproduct.",
  },
  {
    id: "b",
    label: "Response B",
    content:
      "Plants make their own food through photosynthesis. Using sunlight captured by chlorophyll, they combine CO2 from the air with water drawn up through their roots. This produces glucose for energy and releases oxygen into the atmosphere as a waste product.",
  },
];

export default function ResponseCompareDemo() {
  return (
    <ResponseCompare
      prompt="How does photosynthesis work?"
      responses={responses}
      className="max-w-2xl"
    />
  );
}
