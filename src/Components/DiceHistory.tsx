import { Grid, InputLabel, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import type { Dice, RollNumberCount, Theme } from "../App";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type Props = {
  dice: Dice;
  rollNumberCount: RollNumberCount[];
  theme: Theme;
};

function DiceHistory({ dice, rollNumberCount, theme }: Props) {
  const totalRolls = rollNumberCount.reduce((sum, roll) => sum + roll.rollCount, 0);

  return (
    <>
      <Box mt={3} sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <>
              <Typography variant="h5">{`${dice.diceName} Stats`}</Typography>
              <Typography variant="h6">{`Total Rolls (${totalRolls.toLocaleString()})`}</Typography>
              <BarChart
                width={330}
                height={390}
                data={rollNumberCount}
                margin={{
                  top: 10,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="1 1" />
                <XAxis dataKey="rollNumber" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rollCount" fill={theme.colors.charts} />
              </BarChart>
            </>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default DiceHistory;
