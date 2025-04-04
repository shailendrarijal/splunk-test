export enum CPUModel {
    POWER = 'Power',
    ARM = 'ARM',
    X86 = 'X86'
};

export enum ServerModels {
    TOWER_SERVER = 'Tower Server',
    RACK_SERVER = '4U Rack Server',
    MAINFRAME = 'Mainframe',
    HIGH_DENSITY_SERVER = 'High Density Server',
    NO_OPTIONS = 'No Options'
}

export const errorMessages = {
    MEMORY_INVALID_INPUT: 'Please only enter numbers',
    MEMORY_SIZE_NOT_MULTIPLE: 'Memory size must be multiple of 1028 and power of 2',
    MEMORY_SIZE_MIN: 'Memory size must be at least 4096 MB',
    MEMORY_SIZE_MAX: 'Memory size must be less than 8388608 MB',
    FIX_ERROR_BEFORE_SUBMIT: 'Please fix the error above before submitting'
}

export const memorySizeHelperText = 'Memory size range: 4096 MB to 8388608 MB';