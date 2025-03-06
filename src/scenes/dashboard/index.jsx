import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from "@mui/icons-material/Badge";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { useState, useEffect } from "react";

const Dashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [licenseCount, setLicenseCount] = useState(null);
    const [userCount, setUserCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const licenseResponse = await fetch("http://localhost:3399/lic/user/license/count"); // SAME URL - Fixed
                if (!licenseResponse.ok) {
                    throw new Error(`HTTP error! status: ${licenseResponse.status}`);
                }
                const licenseData = await licenseResponse.json();
                setLicenseCount(licenseData.count);

                const userResponse = await fetch("http://localhost:3399/lic/user/count");
                if (!userResponse.ok) {
                    throw new Error(`HTTP error! status: ${userResponse.status}`);
                }
                const userData = await userResponse.json();
                setUserCount(userData.count);

            } catch (err) {
                console.error("Failed to fetch data", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
      return (
        <Box m="20px">
          <Header title="Dashboard" subtitle="Carregando dados..." />
          <Box>Carregando...</Box> {/* Replace with a better loading indicator */}
        </Box>
      );
    }
  
    if (error) {
      return (
        <Box m="20px">
          <Header title="Dashboard" subtitle="Erro ao carregar dados" />
          <Box color="red">Error: {error.message}</Box>
        </Box>
      );
    }

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
                        title={licenseCount !== null ? licenseCount : "N/A"}
                        subtitle="Licenças distribuidas"
                        icon={
                            <BadgeIcon
                                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                            />
                        }
                    />
                </Box>

                <Box
                    gridColumn="span 3"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <StatBox
                        title={userCount !== null ? userCount : "N/A"}
                        subtitle="Usuários"
                        icon={
                            <PeopleIcon
                                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                            />
                        }
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;