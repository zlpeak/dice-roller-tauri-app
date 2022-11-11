import {
  Button,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";
import React, { useCallback, useState } from "react";
import { diceList, Dice, dir, fileName } from "../App";
import { writeTextFile, readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import RollResult, { RollResultColors } from "./RollResult";

export type RollResult = {
  date: string;
  diceType: Dice;
  diceCount: number;
  rolls: number[];
  modifier: number;
  total: number;
};

const defaultSelectedDice: Dice = { diceNum: 20, diceName: "d20", display: "individual" };

type Props = {
  rerenderHistory: boolean;
  setRerender: (rerender: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
};

function DiceRoller({ rerenderHistory, setRerender, setIsLoading }: Props) {
  const [diceCount, setDiceCount] = useState<number>(1);
  const [selectedDice, setSelectedDice] = useState<Dice>(defaultSelectedDice);
  const [diceResults, setDiceResults] = useState<RollResult | undefined>(undefined);
  const [modifier, setModifier] = useState<number>(0);

  const postRolls = async (body: RollResult) => {
    let data: RollResult[] = [];
    data = JSON.parse(
      await readTextFile(`${dir}/${fileName}`, {
        dir: BaseDirectory.App,
      })
    );

    data.push({ ...body });

    await writeTextFile(`${dir}/${fileName}`, JSON.stringify(data), {
      dir: BaseDirectory.App,
    });
  };

  const rollDice = async (diceCount: number, dice: Dice, modifier: number) => {
    let total = 0;
    const rolls: number[] = [];

    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * dice.diceNum + 1);
      total += roll;
      rolls.push(roll);
    }

    total += modifier;

    const diceResults = {
      date: new Date().toISOString(),
      diceType: dice,
      diceCount: diceCount,
      rolls: rolls,
      modifier: modifier,
      total: total,
    };

    await postRolls(diceResults);
    setDiceResults(diceResults);
    setRerender(!rerenderHistory);
  };

  const clearSelections = () => {
    setDiceCount(1);
    setSelectedDice(defaultSelectedDice);
    setDiceResults(undefined);
    setModifier(0);
  };

  const getDiceRangeColor = (
    rollNumber: number,
    dice: Dice,
    fieldType: "normal" | "total"
  ): RollResultColors => {
    const badRollBoundary = dice.diceNum / 3;
    const midRollBoundary = badRollBoundary + dice.diceNum / 3;

    let displayColor: RollResultColors;
    if (dice.diceName === "d20" && fieldType == "normal" && rollNumber === dice.diceNum) {
      displayColor = "rainbow";
    } else if (rollNumber <= badRollBoundary) {
      displayColor = "red";
    } else if (rollNumber <= midRollBoundary) {
      displayColor = "yellow";
    } else {
      displayColor = "green";
    }

    return displayColor;
  };

  const getSummedResultsDisplay = useCallback(() => {
    if (!diceResults || !diceResults?.diceType) return <></>;

    const display = diceResults?.rolls?.map((roll, index) => {
      const displayColor = getDiceRangeColor(roll, diceResults.diceType, "normal");

      return (
        <>
          <Grid item key={index}>
            <RollResult color={displayColor}>{roll}</RollResult>
          </Grid>
          <Grid item>
            <Typography>+</Typography>
          </Grid>
        </>
      );
    });

    const totalDisplayColor = getDiceRangeColor(diceResults.total, diceResults.diceType, "total");

    return (
      <Grid container spacing={1} direction="row" justifyContent="center" alignItems="center">
        {display}
        <Grid item>
          <RollResult color="none">{diceResults?.modifier || "0 "}</RollResult>
        </Grid>
        <Grid item>
          <Typography>=</Typography>
        </Grid>
        <Grid item>
          <RollResult color={totalDisplayColor}>{diceResults.total}</RollResult>
        </Grid>
      </Grid>
    );
  }, [diceResults]);

  const getIndividualResults = useCallback(() => {
    return diceResults?.rolls?.map((roll, index) => {
      const total = roll + diceResults.modifier;

      const displayColor = getDiceRangeColor(roll, diceResults.diceType, "normal");
      const totalDisplayColor = getDiceRangeColor(total, diceResults.diceType, "total");

      return (
        <>
          <Grid
            key={index}
            container
            spacing={2}
            padding={1}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item>
              <RollResult color={displayColor}>{roll}</RollResult>
            </Grid>
            <Grid item>
              <Typography>+</Typography>
            </Grid>
            <Grid item>
              <RollResult color="none">{diceResults?.modifier || "0 "}</RollResult>
            </Grid>
            <Grid item>
              <Typography>=</Typography>
            </Grid>
            <Grid item>
              <RollResult color={totalDisplayColor}>{total}</RollResult>
            </Grid>
          </Grid>
        </>
      );
    });
  }, [diceResults]);

  return (
    <>
      <Box m={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <InputLabel>Dice Type</InputLabel>
            <Select
              value={selectedDice.diceName}
              fullWidth={true}
              onChange={(e: SelectChangeEvent) => {
                setDiceResults(undefined);
                const dice = diceList.find((d) => d.diceName === e.target.value);
                if (dice && dice.diceName) {
                  setSelectedDice(dice);
                }
              }}
            >
              {diceList.map((dice, index) => (
                <MenuItem key={index} value={dice.diceName}>
                  {dice.diceName}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Dice Count</InputLabel>
            <TextField
              variant="outlined"
              value={diceCount}
              type="number"
              fullWidth={false}
              onChange={(e) => {
                const value = parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value);
                setDiceCount(value);
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <InputLabel>Modifier</InputLabel>
            <TextField
              variant="outlined"
              value={modifier}
              type="number"
              fullWidth={false}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            />
          </Grid>
          <Grid item xs={6}>
            <Button onClick={() => clearSelections()} variant="contained" color="secondary">
              Clear
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={async () => {
                setIsLoading(true);
                if (selectedDice) rollDice(diceCount, selectedDice, modifier);
              }}
              variant="contained"
            >
              Roll
            </Button>
          </Grid>
          <Grid item xs={12}>
            {diceResults && diceResults.diceType.display === "individual"
              ? getIndividualResults()
              : getSummedResultsDisplay()}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default DiceRoller;
