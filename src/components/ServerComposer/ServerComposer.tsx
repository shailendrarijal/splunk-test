import { useState } from "react";
import { Typography, Grid, Box, FormControl, MenuItem, Select, Checkbox, TextField, FormControlLabel, Button, Divider, List, ListItem, ListItemIcon, InputLabel, InputAdornment, SelectChangeEvent } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import { errorMessages, memorySizeHelperText, CPUModel, ServerModels } from "./constants";

const ServerComposer = () => {
    const [cpuModel, setCpuModel] = useState<CPUModel>(CPUModel.POWER);
    const [memorySize, setMemorySize] = useState<string>('');
    const [graphicCardPresent, setGraphicCardPresent] = useState<boolean>(false);
    const [serverModel, setServerModel] = useState<ServerModels[]>([]);
    const [memorySizeInputError, setMemorySizeInputError] = useState<boolean>(false);
    const [memorySizeErrorMessage, setmemorySizeErrorMessage] = useState<string>('');
    const [showResults, setShowResults] = useState<boolean>(false);
    const [errorPresent, setErrorPresent] = useState<boolean>(false);

    const handleCpuModelChange = (event: SelectChangeEvent<CPUModel>) => {
        setCpuModel(event.target.value as CPUModel);
    }

    // format memory size to add commas
    const formatMemorySizeToNumber = (memorySize: string): string => {
        const commaAddedMemorySize = memorySize.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return commaAddedMemorySize
    }

    const handleMemorySizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMemorySize(formatMemorySizeToNumber(value));
    };

    // trigger error if memory size input is invalid
    const checkMemorySizeError = (memorySize: number) => {
        if (memorySize < 4096) {
            setMemorySizeInputError(true);
            setmemorySizeErrorMessage(errorMessages.MEMORY_SIZE_MIN);
            return true;
        }
        if (memorySize > 8388608) {
            setMemorySizeInputError(true);
            setmemorySizeErrorMessage(errorMessages.MEMORY_SIZE_MAX);
            return true;
        }
        if (memorySize % 1024 !== 0) {
            setMemorySizeInputError(true);
            setmemorySizeErrorMessage(errorMessages.MEMORY_SIZE_NOT_MULTIPLE);
            return true;
        }
        return false;
    }

    const handleMemorySizeonBlur = () => {
        const parsedMemorySize = parseInt(memorySize.replace(/,/g, ''));
        if (checkMemorySizeError(parsedMemorySize)) return;
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGraphicCardPresent(event.target.checked);
    }

    const handleSubmit = () => {
        const parsedMemorySize = parseInt(memorySize.replace(/,/g, ''));
        if (checkMemorySizeError(parsedMemorySize)) {
            setErrorPresent(true);
            return;
        }
        setShowResults(true);
        // Rules ------------------------------------------------------
        // Rule 1
        if (graphicCardPresent && cpuModel === CPUModel.ARM && parsedMemorySize >= 524288) {
            setServerModel([ServerModels.HIGH_DENSITY_SERVER]);
            return;
        }
        // Rule 2
        if (!graphicCardPresent && cpuModel === CPUModel.POWER && parsedMemorySize >= 2048) {
            setServerModel([ServerModels.MAINFRAME, ServerModels.RACK_SERVER, ServerModels.TOWER_SERVER]);
            return;
        }
        // Rule 3a
        if (!graphicCardPresent && (cpuModel === CPUModel.POWER || cpuModel === CPUModel.X86) && parsedMemorySize >= 131072) {
            setServerModel([ServerModels.TOWER_SERVER, ServerModels.RACK_SERVER]);
            return;
        }
        // Rule 3b
        if (!graphicCardPresent && (cpuModel === CPUModel.POWER || cpuModel === CPUModel.X86) && parsedMemorySize < 131072) {
            setServerModel([ServerModels.TOWER_SERVER]);
            return;
        }
        // Rule 5
        setServerModel([ServerModels.NO_OPTIONS]);
        // Rules end ------------------------------------------------------
    }

    return (
        <Box sx={{ padding: '1rem', width: '100%', margin: '0 auto' }}>
            <Typography variant="h1" align="left" sx={{ fontSize: '1.7rem', fontWeight: 'fontWeightBold', mb: 4 }}>Server Composer</Typography>
            <FormControl fullWidth>
                <Grid container spacing={8} sx={{ px: 2 }}>
                    <Grid size={4}>
                        <Box>
                            <InputLabel id="cpu-input-label">CPU</InputLabel>
                            <Select
                                id="cpu-input"
                                labelId="cpu-input-label"
                                value={cpuModel}
                                onChange={handleCpuModelChange}
                                size="small"
                                fullWidth
                            >
                                <MenuItem value={CPUModel.POWER}>Power</MenuItem>
                                <MenuItem value={CPUModel.ARM}>ARM</MenuItem>
                                <MenuItem value={CPUModel.X86}>X86</MenuItem>
                            </Select>
                        </Box>
                    </Grid>
                    <Grid size={4}>
                        <Box>
                            <TextField
                                error={memorySizeInputError}
                                type="string"
                                label="Memory size"
                                value={memorySize}
                                id="memory-size-text-input"
                                helperText={memorySizeInputError ? memorySizeErrorMessage : memorySizeHelperText}
                                fullWidth
                                size="small"
                                onChange={handleMemorySizeChange}
                                onBlur={handleMemorySizeonBlur}
                                onFocus={() => {
                                    setMemorySizeInputError(false)
                                    setErrorPresent(false)
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                                    }
                                }}
                                
                            />
                        </Box>
                    </Grid>
                    <Grid size={2}>
                        <Box>
                            <FormControlLabel
                                label="GPU Accelerator Card"
                                control={
                                    <Checkbox
                                        onChange={handleCheckboxChange}
                                    />
                                }
                            />
                        </Box>
                    </Grid>
                    <Grid size={4} display="flex" alignItems="flex-start">
                        <Box>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{ mb: 4, backgroundColor: '#ccc', color: '#000', textTransform: 'capitalize', fontWeight: 'fontWeightBold' }}
                                onClick={handleSubmit}
                            >Submit</Button>
                        </Box>
                    </Grid>
                </Grid>
            </FormControl>
            <Divider />
            {errorPresent && (
                <Box sx={{ backgroundColor: '#EECED1', p: 2, mt: 4, width: '50%' }}>
                    <Typography variant="body1" align="left" sx={{ fontSize: '1.5rem', fontWeight: 'fontWeightBold', mt: 4 }}>{errorMessages.FIX_ERROR_BEFORE_SUBMIT}</Typography>
                </Box>
            )}
            {showResults && (
                <Box>
                    <Typography variant="h2" align="left" sx={{ fontSize: '1.5rem', fontWeight: 'fontWeightBold', mt: 4 }}>Server Model Options</Typography>
                    <List>
                        {serverModel.map((model, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <CircleIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="body1" align="left">{model}</Typography>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    )
}

export default ServerComposer;