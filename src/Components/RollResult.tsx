import React from "react";

import { Paper } from "@mui/material";
import { Hex } from "../App";

export type RollResultColors = "red" | "yellow" | "green" | "rainbow" | "none";

type Props = {
  color: RollResultColors;
  children: React.ReactNode;
};

function RollResult({ color, children }: Props) {
  let isAnimated = false;
  let hexCode: Hex = "#FFFFFF";
  switch (color) {
    case "red":
      hexCode = "#FF6D66";
      break;
    case "yellow":
      hexCode = "#F7FF4C";
      break;
    case "green":
      hexCode = "#A4FF66";
      break;
    case "rainbow":
      isAnimated = true;
      break;
  }

  return (
    <Paper
      className={isAnimated ? "rainbow" : ""}
      sx={{
        backgroundColor: hexCode,
        padding: 1,
        textAlign: "center",
        color: "#000000",
      }}
    >
      {children}
    </Paper>
  );
}

export default RollResult;
