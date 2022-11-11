import React, { useEffect, useState } from "react";
import "./App.css";

import {
  Card,
  createTheme,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import DiceRoller from "./Components/DiceRoller";
import DiceHistory from "./Components/DiceHistory";
import type { RollResult } from "./Components/DiceRoller";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Loading } from "./Components/Loading";

import { createDir, readTextFile, BaseDirectory, writeTextFile } from "@tauri-apps/api/fs";
import moment from "moment";
import { Box, Container } from "@mui/system";

export type Dice = {
  diceNum: number;
  diceName: string;
  display: "add" | "individual";
};

export const diceList: Dice[] = [
  { diceNum: 2, diceName: "d2", display: "add" },
  { diceNum: 2, diceName: "d2(separate)", display: "individual" },
  { diceNum: 4, diceName: "d4", display: "add" },
  { diceNum: 6, diceName: "d6", display: "add" },
  { diceNum: 8, diceName: "d8", display: "add" },
  { diceNum: 10, diceName: "d10", display: "add" },
  { diceNum: 12, diceName: "d12", display: "add" },
  { diceNum: 20, diceName: "d20", display: "individual" },
  { diceNum: 100, diceName: "d100", display: "individual" },
];

export type RollNumberCount = {
  rollNumber: number;
  rollCount: number;
};

export type Hex = `#${string}`;

type ThemeColors = {
  background: Hex;
  charts: Hex;
  contrastText: Hex;
};

export type Theme = {
  name: string;
  colors: ThemeColors;
};

const black: Hex = "#1D1D1D";
const gold: Hex = "#CEB888";
const white: Hex = "#FFFFFF";

const defaultTheme: Theme = {
  name: "Wild Berry",
  colors: {
    background: "#02A5C0",
    charts: "#A67BB0",
    contrastText: black,
  },
};

const themeList: Theme[] = [
  { ...defaultTheme },
  {
    name: "My Wedding",
    colors: {
      background: "#572123",
      charts: "#5392b1",
      contrastText: white,
    },
  },
  {
    name: "Happily Ever Peak",
    colors: {
      background: "#E0BFB8",
      charts: gold,
      contrastText: black,
    },
  },
  {
    name: "Boiler Up",
    colors: {
      background: black,
      charts: gold,
      contrastText: white,
    },
  },
  {
    name: "#PSL",
    colors: {
      background: "#d27254",
      charts: "#ecd292",
      contrastText: black,
    },
  },
  {
    name: "Snow Leopard",
    colors: {
      background: black,
      charts: "#dfe2de",
      contrastText: white,
    },
  },
  {
    name: "Captain America",
    colors: {
      background: "#162CA2",
      charts: "#C31D10",
      contrastText: white,
    },
  },
  {
    name: "Matrix",
    colors: {
      background: black,
      charts: "#2AD03D",
      contrastText: white,
    },
  },
  {
    name: "Hot Dog Stand",
    colors: {
      background: "#FF0000",
      charts: "#FFFF00",
      contrastText: black,
    },
  },
];

export const today = moment(new Date()).format("YYYY-MM-DD");

export const dir = "dice_rolls";
export const fileName = `dice_roll_log_${today}.json`;
export const themeChoice = "theme.json";

function App() {
  const widgetHeight = 500;
  const widgetWidth = 400;

  const [rerenderHistory, setRerenderHistory] = useState<boolean>(false);

  const [selectedStartDate, setSelectedStartDate] = useState<string>("2022-09-02");
  const [selectedEndDate, setSelectedEndDate] = useState<string>(today);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultTheme);

  const [diceRollHistory, setDiceRollHistory] = useState<RollResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const theme = createTheme({
    palette: {
      primary: {
        main: selectedTheme.colors.charts,
        contrastText: selectedTheme.colors.contrastText,
      },
      secondary: {
        main: selectedTheme.colors.background,
        contrastText: selectedTheme.colors.contrastText,
      },
    },
  });

  function addDays(date: Date, days: number) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  React.useMemo(async () => {
    await createDir(`${dir}`, { dir: BaseDirectory.App, recursive: true });

    try {
      await readTextFile(`${dir}/${fileName}`, {
        dir: BaseDirectory.App,
      });
    } catch {
      await writeTextFile(`${dir}/${fileName}`, "[]", {
        dir: BaseDirectory.App,
      });
    }
  }, []);

  React.useMemo(async () => {
    let lastTheme: Theme = defaultTheme;
    try {
      lastTheme = JSON.parse(
        await readTextFile(`${dir}/${themeChoice}`, {
          dir: BaseDirectory.App,
        })
      );
    } catch {
      await writeTextFile(`${dir}/${themeChoice}`, "", {
        dir: BaseDirectory.App,
      });
    }

    setSelectedTheme(lastTheme);
  }, []);

  const fetchRolls = async (selectedStartDate: string, selectedEndDate: string) => {
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);

    let response = [];
    if (Boolean(start) && Boolean(end)) {
      const Difference_In_Time = end.getTime() - start.getTime();

      const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

      let i: number = 0;
      while (i <= Difference_In_Days) {
        const date = addDays(start, i).toISOString().slice(0, 10);
        const filePath = `${dir}/dice_roll_log_${date}.json`;

        let data = [];
        try {
          data = JSON.parse(
            await readTextFile(filePath, {
              dir: BaseDirectory.App,
            })
          );
        } catch (e) {}

        response.push(data);
        i++;
      }
    } else {
      const filePath = `${dir}/${today}`;

      let data = [];
      try {
        data = JSON.parse(
          await readTextFile(filePath, {
            dir: BaseDirectory.App,
          })
        );
      } catch (e) {}
      response.push(data);
    }
    return response.flat();
  };

  React.useEffect(() => {
    setIsLoading(true);
    void fetchRolls(selectedStartDate, selectedEndDate).then((data) => {
      setDiceRollHistory(data);
      setIsLoading(false);
    });
  }, [selectedStartDate, selectedEndDate, rerenderHistory]);

  const filterDiceRolls = (dice: Dice) => {
    let rollCountArray: RollNumberCount[] = [];
    let i = 1;
    while (i <= dice.diceNum) {
      rollCountArray.push({ rollNumber: i, rollCount: 0 });
      i++;
    }

    diceRollHistory
      .filter((roll) => roll.diceType.diceNum === dice.diceNum)
      .map((roll) => roll.rolls)
      .flat()
      .forEach((roll) => {
        rollCountArray[roll - 1].rollCount += 1 || 0;
      });

    return rollCountArray;
  };

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Box sx={{ backgroundColor: "secondary.main", paddingLeft: 0, paddingRight: 0 }}>
          <Grid
            container
            display="flex"
            spacing={2}
            paddingTop={3}
            justifyContent="center"
            sx={{ backgroundColor: "secondary.main" }}
          >
            <Grid item>
              <Card
                sx={{
                  minWidth: 400,
                  padding: 2,
                  gap: 2,
                  display: "flex",
                  justify: "center",
                  align: "around",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label="Stats Start Date"
                    inputFormat="YYYY-MM-DD"
                    value={selectedStartDate}
                    onChange={(newValue: Dayjs | null) =>
                      newValue && setSelectedStartDate(newValue.format("YYYY-MM-DD"))
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                  <DesktopDatePicker
                    label="Stats End Date"
                    inputFormat="YYYY-MM-DD"
                    value={selectedEndDate}
                    onChange={(newValue: Dayjs | null) =>
                      newValue && setSelectedEndDate(newValue.format("YYYY-MM-DD"))
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
                <FormControl>
                  <InputLabel>Theme Selection</InputLabel>
                  <Select
                    value={selectedTheme.name}
                    onChange={async (e: SelectChangeEvent) => {
                      const theme = themeList.find((t) => t.name === e.target.value);
                      if (theme) {
                        setSelectedTheme(theme);
                        await writeTextFile(`${dir}/${themeChoice}`, JSON.stringify(theme), {
                          dir: BaseDirectory.App,
                        });
                      }
                    }}
                    sx={{ minWidth: 200 }}
                  >
                    {themeList.map((theme, index) => (
                      <MenuItem key={index} value={theme.name}>
                        {theme.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Card>
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            spacing={3}
            marginTop={1}
            justifyContent="center"
            alignItems="center"
            sx={{ backgroundColor: "secondary.main" }}
          >
            <Grid item sx={{ maxWidth: widgetWidth }}>
              <Card sx={{ minHeight: widgetHeight, maxHeight: widgetHeight, overflow: "auto" }}>
                <DiceRoller
                  rerenderHistory={rerenderHistory}
                  setRerender={(rerender: boolean) => setRerenderHistory(rerender)}
                  setIsLoading={(isLoading: boolean) => setIsLoading(isLoading)}
                />
              </Card>
            </Grid>
            {diceList.map((dice, index) => {
              if (dice.diceName !== "d2(separate)") {
                return (
                  <Grid item sx={{ width: widgetWidth }} key={index}>
                    <Card sx={{ minHeight: widgetHeight, maxHeight: widgetHeight }}>
                      <DiceHistory
                        dice={dice}
                        rollNumberCount={filterDiceRolls(dice)}
                        theme={selectedTheme}
                      />
                    </Card>
                  </Grid>
                );
              }
            })}
          </Grid>
          {isLoading && <Loading />}
        </Box>
      </ThemeProvider>
    </div>
  );
}

export default App;

