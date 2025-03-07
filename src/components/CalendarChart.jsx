import { tokens } from "../theme"; // Ensure this path is correct
import { ResponsiveCalendar } from '@nivo/calendar';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTheme } from "@mui/material";
import { green } from "@mui/material/colors";

const CalendarChart = ({ data }) => {
    const theme = useTheme();
    console.log("Theme mode:", theme.palette.mode); // DEBUG: Verify theme mode

    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState(data);

    useEffect(() => {
        setChartData(data);
    }, [data]);

    if (!chartData || chartData.length === 0) {
        return <div>No data available for the calendar.</div>;
    }

    const dates = chartData.map(item => parseISO(item.day));
    const startDate = new Date(Math.min(...dates)).toISOString().slice(0, 10);
    const endDate = new Date(Math.max(...dates)).toISOString().slice(0, 10);

    const values = chartData.map(item => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const colorScale = ['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560'];


    return (
        <ResponsiveCalendar
            data={chartData}
            from={startDate}
            to={endDate}
            align="left"
            emptyColor="#eeeeee"
            colors={colorScale}
            margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
            yearSpacing={40}
            monthBorderColor={colors.grey[300]}
            dayBorderWidth={3}
            dayBorderColor={colors.grey[300]}
            minValue={minValue}
            maxValue={maxValue}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'row',
                    translateY: 36,
                    itemCount: 4,
                    itemWidth: 42,
                    itemHeight: 36,
                    itemsSpacing: 14,
                    itemDirection: 'right-to-left',
                }
            ]}
   
        />
    );
};

export default CalendarChart;