import { Box, useTheme, Typography } from "@mui/material";
import { tokens } from "../../theme";
import PeopleIcon from '@mui/icons-material/People';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { useState, useEffect } from "react";
import CalendarChart from "../../components/CalendarChart"
import { format, fromUnixTime, parseISO, parse } from 'date-fns';

const Dashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [licenseCount, setLicenseCount] = useState(null);
    const [userCount, setUserCount] = useState(null);
    const [sessionCount, setSessionCount] = useState(null);
    const [calendarData, setCalendarData] = useState([]);
    const [licenseLoading, setLicenseLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(true);
    const [licenseError, setLicenseError] = useState(null);
    const [userError, setUserError] = useState(null);
    const [sessionError, setSessionError] = useState(null);
    const [calendarError, setCalendarError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLicenseLoading(true);
            setUserLoading(true);
            setSessionLoading(true);
            setCalendarLoading(true);
            setLicenseError(null);
            setUserError(null);
            setSessionError(null);
            setCalendarError(null);

            try {
                const licenseResponse = await fetch("http://localhost:3399/lic/user/license/count");
                if (!licenseResponse.ok) {
                    throw new Error(`HTTP error! license status: ${licenseResponse.status}`);
                }
                const licenseData = await licenseResponse.json();
                setLicenseCount(licenseData.count);

                const userResponse = await fetch("http://localhost:3399/lic/user/count");
                if (!userResponse.ok) {
                    throw new Error(`HTTP error! user status: ${userResponse.status}`);
                }
                const userData = await userResponse.json();
                setUserCount(userData.count);

                const sessionResponse = await fetch("http://localhost:3399/lic/user/license/session/count");
                if (!sessionResponse.ok) {
                    throw new Error(`HTTP error! session status: ${sessionResponse.status}`);
                }
                const sessionData = await sessionResponse.json();
                setSessionCount(sessionData);


                const calendarResponse = await fetch("http://localhost:3399/lic/user/license/session/totalUseTimeByDay");  
                if (!calendarResponse.ok) {
                    throw new Error(`HTTP error! calendar status: ${calendarResponse.status}`);
                }
                const apiData = await calendarResponse.json();
                
                const transformedData = Object.entries(apiData).map(([date, value]) => {  
                    let parsedDate;
                
                    try {
                        parsedDate = parseISO(date); 
                    } catch (error) {
                      
                        try {
                          parsedDate = parse(date, 'yyyy-MM-dd', new Date()); 
                        } catch(error2) {
                          console.error("Could not parse date: " + date, error2);
                          return null;
                        }
                    }
                
                    return {
                        day: format(parsedDate, 'yyyy-MM-dd'),
                        value: value,
                    };
                }).filter(item => item !== null);
                
                setCalendarData(transformedData);

            } catch (error) {
                console.error("Failed to fetch data", error);
                if(error.message.includes("license status")) {
                    setLicenseError(error);
                } else if (error.message.includes("user status")) {
                    setUserError(error);
                }  else if (error.message.includes("session status")) {
                    setSessionError(error);
                } else {
                    setCalendarError(error);
                }

            } finally {
                setLicenseLoading(false);
                setUserLoading(false);
                setSessionLoading(false);
                setCalendarLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="DASHBOARD" subtitle="Este é seu Dashboard de Licenciamento"/>
            </Box>

            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="140px"
                gap="20px"
            >
                <Box
                    gridColumn="span 3"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <StatBox
                        title={userLoading ? "Carregando..." : (userCount !== null ? userCount : "N/A")}
                        subtitle="Usuários"
                        icon={
                            <PeopleIcon
                                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                            />
                        }
                    />
                    {userError && <Typography color="error">{userError.message}</Typography>}
                </Box>

                <Box
                    gridColumn="span 3"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <StatBox
                        title={licenseLoading ? "Carregando..." : (licenseCount !== null ? licenseCount : "N/A")}
                        subtitle="Sessões ativas"
                        icon={
                            <AssessmentOutlinedIcon
                                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                            />
                        }
                    />
                    {licenseError && <Typography color="error">{licenseError.message}</Typography>}
                </Box>
                <Box
                    gridColumn="span 3"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <StatBox
                        title={sessionLoading ? "Carregando..." : (sessionCount !== null ? sessionCount : "N/A")}
                        subtitle="Sessões registradas"
                        icon={
                            <AssessmentOutlinedIcon
                                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                            />
                        }
                    />
                    {sessionError && <Typography color="error">{sessionError.message}</Typography>}
                </Box>
            </Box>

            {/* ROW 2 */}
            <Box
                gridColumn="span 8"
                gridRow="span 2"
                backgroundColor={colors.primary[400]}
            >
                <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography
                            variant="h5"
                            fontWeight="600"
                            color={colors.grey[100]}
                        >
                        </Typography>
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            color={colors.greenAccent[500]}
                        >
                        </Typography>
                    </Box>
                    <Box>
                    </Box>
                </Box>
                <Box height="250px" m="-20px 0 0 0">
                    {calendarLoading && <Typography>Carregando dados do calendário...</Typography>}
                    {calendarError && <Typography color="error">Erro ao carregar calendário: {calendarError.message}</Typography>}
                    {!calendarLoading && !calendarError && (
                        <CalendarChart data={calendarData} />
                    )}
                </Box>
            </Box>

        </Box>
    );
};

export default Dashboard;