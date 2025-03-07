import { Box, useTheme, IconButton, TextField, Button, Modal, Typography, Divider } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Swal from 'sweetalert2';

const Contacts = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [contacts, setContacts] = useState([]); // All users
    const [selectedUserLicenses, setSelectedUserLicenses] = useState([]); // Licenses of the selected user
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // State for the new user form
    const [newEmail, setNewEmail] = useState("");
    const [newRegisterDate, setNewRegisterDate] = useState("");
    const [newIsEnabled, setNewIsEnabled] = useState(true); // Default to enabled

    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false); // Modal for workspace details
    const [selectedUserId, setSelectedUserId] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get("http://localhost:3399/lic/user");

                console.log("API Response:", response.data);

                const formattedData = response.data.map((item, index) => ({
                    id: item.id || index,
                    registerDate: item.registerDate ? new Date(item.registerDate).toLocaleString() : "N/A",
                    ip: item.ip || "N/A",
                    email: item.email || "N/A",
                    isEnable: item.enabled != null ? (item.enabled ? 'Sim' : 'Não') : "N/A"
                }));

                setContacts(formattedData);

            } catch (err) {
                setError(err);
                console.error("Error fetching contacts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEditClick = (id) => {
        navigate(`/edit/${id}`);
    };

    const handleDetailsClick = (id) => {
        setSelectedUserId(id); // Store the selected user ID
        setIsWorkspaceModalOpen(true); // Open the workspace modal
    };

    useEffect(() => {
        const fetchUserLicenses = async () => {
            if (selectedUserId) {
                setLoading(true);
                setError(null);

                try {
                    const response = await axios.get(`http://localhost:3399/lic/user/${selectedUserId}`); //  endpoint to get license details for user with id

                    const formattedLicenses = response.data.map((item, index) => ({
                        id: item.id || index, // Use item.id if available, otherwise index
                        registerDate: item.registerDate ? new Date(item.registerDate).toLocaleString() : "N/A", // Check for null
                        ip: item.ip || "N/A", // Add null checks
                        serialCode: item.serialCode || "N/A",
                        serialCodeEncrypted: item.serialCodeEncrypted || "N/A",
                        lastAction: item.actionLogs?.[item.actionLogs.length - 1]?.actionName || "N/A", // Safe navigation
                        lastSession: item.sessions?.sort((a, b) => new Date(b.entrada) - new Date(a.entrada))[0]?.entrada //Use .entrada directly and also add .entrada in sorting
                            ? new Date(item.sessions.sort((a, b) => new Date(b.entrada) - new Date(a.entrada))[0].entrada * 1000).toLocaleString()
                            : "N/A", // Safe navigation and check entrada existence
                    }));


                    setSelectedUserLicenses(formattedLicenses); // Set the fetched licenses


                } catch (err) {
                    setError(err);
                    console.error("Error fetching licenses:", err);
                    Swal.fire({
                        title: "Erro!",
                        text: "Erro ao carregar detalhes do workspace",
                        icon: "error",
                        zIndex: 2000
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserLicenses();
    }, [selectedUserId]); // Fetch when selectedUserId changes

    const handleCloseWorkspaceModal = () => {
        setIsWorkspaceModalOpen(false);
        setSelectedUserId(null); // Clear the selected user ID
        setSelectedUserLicenses([]); // Clear the licenses data when modal closes
    };
    
    const handleDeleteClick = async (id) => {
        Swal.fire({
            title: 'Tem certeza que deseja excluir este usuário?',
            text: "Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, exclua!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                axios.delete(`http://localhost:3399/lic/user/${id}`)
                    .then(response => {
                        // Handle successful deletion (e.g., remove from the local state)
                        console.log("User deleted successfully", response);
                        setContacts(contacts.filter(contact => contact.id !== id)); // Remove from local state

                        Swal.fire(
                            'Excluído!',
                            'O usuário foi excluído.',
                            'success'
                        )
                    })
                    .catch(error => {
                        console.error("Error deleting user", error);
                        Swal.fire(
                            'Erro!',
                            'Ocorreu um erro ao excluir o usuário.',
                            'error'
                        )
                    });
            }
        })
    };

    const handleCreateUser = async () => {
        try {
            // Basic validation - enhance as needed
            if (!newEmail || !newRegisterDate) {
                Swal.fire({
                    title: "Erro!",
                    text: "Por favor, preencha todos os campos.",
                    icon: "error",
                    zIndex: 2000
                });
                return;
            }

            const newUser = {
                email: newEmail,
                registerDate: new Date(newRegisterDate).toISOString(), // Convert to ISO string for backend
                enabled: newIsEnabled,
            };

            // Post to the Backend
            const response = await axios.post("http://localhost:3399/lic/user", newUser);

            if (response.status === 201) { // Assuming a successful creation returns 201 Created
                const createdUser = response.data; // Backend should return the full created user object
                const formattedUser = {
                    id: createdUser.id,
                    registerDate: new Date(createdUser.registerDate).toLocaleString(),
                    ip: createdUser.ip || "N/A",
                    email: createdUser.email,
                    isEnable: createdUser.enabled ? 'Sim' : 'Não'
                };

                setContacts([...contacts, formattedUser]); // Add the new user to the local state
                Swal.fire({
                    title: "Sucesso!",
                    text: "Usuário criado com sucesso.",
                    icon: "success",
                    zIndex: 2000
                });
                handleCloseModal();

                // Clear the form fields
                setNewEmail("");
                setNewRegisterDate("");
                setNewIsEnabled(true);
            } else {
                Swal.fire({
                    title: "Erro!",
                    text: "Ocorreu um erro ao criar o usuário.",
                    icon: "error",
                    zIndex: 2000
                });
            }

        } catch (error) {
            console.error("Error creating user", error);
            Swal.fire({
                title: "Erro!",
                text: "Ocorreu um erro ao criar o usuário.",
                icon: "error",
                zIndex: 2000
            });
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "registerDate", headerName: "Registrado em", flex: 1 },
        { field: "isEnable", headerName: "Ativo", flex: 1 },
        {
            width: 180, // Increased width to accommodate both buttons
            renderCell: (params) => {
                return (
                    <Box>
                        <IconButton onClick={() => handleEditClick(params.row.id)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(params.row.id)}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDetailsClick(params.row.id)}>
                            <ArticleOutlinedIcon />
                        </IconButton>
                    </Box>
                );
            },
        },
       
    ];

    const licenseColumns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "ip", headerName: "Endereço IP", flex: 1 },
        { field: "registerDate", headerName: "Registrado em", flex: 1 },
        { field: "serialCodeEncrypted", headerName: "Serial da maquina SHA-256", flex: 1 },
        { field: "lastAction", headerName: "Última ação", flex: 1 },
        { field: "lastSession", headerName: "Última sessão", flex: 1 },

    ];


    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: colors.primary[300],
        boxShadow: 24,
        p: 4,
    };

      const workspaceModalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%', // Adjust as needed
        height: '80%', // Adjust as needed
        bgcolor: colors.primary[400], // Changed to a slightly lighter shade
        boxShadow: 24,
        p: 4,
        overflow: 'auto',
        borderRadius: '10px', // Added border radius for a softer look
    };

    if (loading) {
        return (
            <Box m="20px">
                <Header title="Usuários" subtitle="Carregando Usuários..." />
                <Box>Carregando...</Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box m="20px">
                <Header title="Usuários" subtitle="Erro ao carregar Usuários" />
                <Box color="red">Error: {error.message}</Box>
        </Box>
        );
    }

    return (
        <Box m="20px">
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
                <Header
                    title="Usuários"
                    subtitle="Lista e criação de usuários"
                />
                {/* Button to Open Modal */}
                <Button variant="contained" color="secondary" onClick={handleOpenModal}>
                    Criar Novo Usuário
                </Button>
            </Box>

            {/* Modal */}
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle} backgroundColor={colors.grey[400]}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Criar Novo Usuário
                    </Typography>
                    <Box display="flex" flexDirection="column" gap="20px" mt="20px" >
                        <TextField
                            label="Email"
                            variant="outlined"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <Box display="flex" alignItems="center">
                            <label htmlFor="isEnable">Ativo:</label>
                            <input
                                type="checkbox"
                                id="isEnable"
                                checked={newIsEnabled}
                                onChange={(e) => setNewIsEnabled(e.target.checked)}
                            />
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                            <Button variant="contained" color="primary" onClick={handleCreateUser}>
                                Criar
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleCloseModal}>
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>


            {/* Workspace Modal */}
            <Modal
                open={isWorkspaceModalOpen}
                onClose={handleCloseWorkspaceModal}
                aria-labelledby="workspace-modal-title"
                aria-describedby="workspace-modal-description"
            >
                <Box sx={workspaceModalStyle} backgroundColor={colors.grey[400]}>
                    <Typography id="workspace-modal-title" variant="h5" component="h2" mb="10px"> {/* Slightly larger title with margin */}
                        Detalhes do Workspace
                    </Typography>
                    <Divider sx={{ mb: 2 }} /> {/* Added a divider line */}

                    {loading ? (
                        <Box>Carregando detalhes do workspace...</Box>
                    ) : error ? (
                        <Box color="red">Erro ao carregar detalhes: {error.message}</Box>
                    ) : (
                        <Box m="10px 0 0 0" height="60vh"> {/* Reduced margin */}
                            {selectedUserLicenses.length > 0 ? (
                                <DataGrid
                                    rows={selectedUserLicenses}
                                    columns={licenseColumns}
                                    components={{ Toolbar: GridToolbar }}
                                    sx={{
                                        "& .MuiDataGrid-root": {
                                            border: "none",
                                        },
                                        "& .MuiDataGrid-cell": {
                                            borderBottom: "none",
                                        },
                                        "& .name-column--cell": {
                                            color: colors.greenAccent[300],
                                        },
                                        "& .MuiDataGrid-columnHeaders": {
                                            backgroundColor: colors.blueAccent[700],
                                            borderBottom: "none",
                                            fontWeight: 'bold', // Make column headers bold
                                        },
                                        "& .MuiDataGrid-virtualScroller": {
                                            backgroundColor: colors.primary[400],
                                        },
                                        "& .MuiDataGrid-footerContainer": {
                                            borderTop: "none",
                                            backgroundColor: colors.blueAccent[700],
                                        },
                                        "& .MuiCheckbox-root": {
                                            color: `${colors.greenAccent[200]} !important`,
                                        },
                                        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                                            color: `${colors.grey[100]} !important`,
                                        },
                                    }}
                                />
                            ) : (
                                <Typography>Nenhuma sessão encontrada para este usuário.</Typography>
                            )}
                             <Box mt={2} display="flex" justifyContent="flex-end">
                                  <Button variant="contained" color="secondary" onClick={handleCloseWorkspaceModal}>
                                     Fechar
                                  </Button>
                             </Box>
                        </Box>
                    )}

                </Box>
            </Modal>

            <Box
                m="40px 0 0 0"
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .name-column--cell": {
                        color: colors.greenAccent[300],
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={contacts}
                    columns={columns}
                    components={{ Toolbar: GridToolbar }}
                />
            </Box>
        </Box>
    );
};

export default Contacts;