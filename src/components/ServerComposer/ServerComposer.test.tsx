import { render, screen, fireEvent } from '@testing-library/react';
import ServerComposer from './ServerComposer';
import { errorMessages, CPUModel, ServerModels, memorySizeHelperText} from "./constants";

describe('ServerComposer Component', () => {

    const renderComponent = () => {
        render(<ServerComposer />);

        const heading = screen.getByText('Server Composer');
        const cpuSelect = screen.getByLabelText('CPU');
        const memoryInput = screen.getByLabelText('Memory size');
        const gpuCheckbox = screen.getByLabelText('GPU Accelerator Card');
        const submitButton = screen.getByText('Submit');

        return { heading, cpuSelect, memoryInput, gpuCheckbox, submitButton }
    }

    it('renders the component correctly', () => {
        const { heading, cpuSelect, memoryInput, gpuCheckbox, submitButton } = renderComponent();

        expect(heading).toBeInTheDocument();
        expect(cpuSelect).toBeInTheDocument();
        expect(memoryInput).toBeInTheDocument();
        expect(gpuCheckbox).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
        expect(screen.getByText(memorySizeHelperText)).toBeInTheDocument();
    });

    // input validation test - onBlur - invalid memory size
    it('displays correct error message for invalid memory size input', () => {
        const { memoryInput } = renderComponent();

        render(<ServerComposer />);
        fireEvent.change(memoryInput, { target: { value: '4097' } });
        fireEvent.blur(memoryInput);
        expect(screen.getByText(errorMessages.MEMORY_SIZE_NOT_MULTIPLE)).toBeInTheDocument();
    });

    // input validation test - onBlur - less than min memory size
    it('displays correct error message for less than min memory size input', () => {
        const { memoryInput } = renderComponent();

        render(<ServerComposer />);
        fireEvent.change(memoryInput, { target: { value: '2048' } });
        fireEvent.blur(memoryInput);
        expect(screen.getByText(errorMessages.MEMORY_SIZE_MIN)).toBeInTheDocument();
    });

    // input validation test - onBlur - less than max memory size
    it('displays correct error message for more than max memory size input', () => {
        const { memoryInput } = renderComponent();

        render(<ServerComposer />);
        fireEvent.change(memoryInput, { target: { value: '8388609' } });
        fireEvent.blur(memoryInput);
        expect(screen.getByText(errorMessages.MEMORY_SIZE_MAX)).toBeInTheDocument();
    });

    // input validation test - onBlur - input should only contain numbers
    it('displays correct error message for more than max memory size input', () => {
        const { memoryInput } = renderComponent();

        render(<ServerComposer />);
        fireEvent.change(memoryInput, { target: { value: '4096gh' } });
        fireEvent.blur(memoryInput);
        expect(screen.getByText(errorMessages.MEMORY_INVALID_INPUT)).toBeInTheDocument();
    });

    
    // input validation test - on submit
    it('displays correct error message submit button is clicked when error is present', () => {
        const { memoryInput, submitButton } = renderComponent();

        render(<ServerComposer />);
        fireEvent.change(memoryInput, { target: { value: '4097' } });
        fireEvent.blur(memoryInput);
        fireEvent.click(submitButton);
        expect(screen.getByText(errorMessages.FIX_ERROR_BEFORE_SUBMIT)).toBeInTheDocument();
    });

    // error goes away on focus on memory size input
    it('Error disappears when memory isze input is focused', () => {
        const { memoryInput, submitButton } = renderComponent();

        render(<ServerComposer />);
        fireEvent.change(memoryInput, { target: { value: '4097' } });
        fireEvent.blur(memoryInput);
        fireEvent.click(submitButton);

        expect(screen.getByText(errorMessages.MEMORY_SIZE_NOT_MULTIPLE)).toBeInTheDocument();
        expect(screen.getByText(errorMessages.FIX_ERROR_BEFORE_SUBMIT)).toBeInTheDocument();

        fireEvent.focus(memoryInput);
        expect(screen.queryByText(errorMessages.FIX_ERROR_BEFORE_SUBMIT)).toBeNull();
        expect(screen.queryByText(errorMessages.MEMORY_SIZE_NOT_MULTIPLE)).toBeNull();
    });

    // Rule 1: Only High Density Server is available when selecting GPU
    // Accelerator Card. And the memory must be greater or equal
    // to 524,288MB. And the CPU must be ARM.
    it('shows high density server model for inputs for rule 1', async () => {
        const { cpuSelect, memoryInput, gpuCheckbox, submitButton } = renderComponent();

        fireEvent.mouseDown(cpuSelect);
        const cpuOption = screen.getByText(CPUModel.ARM);
        fireEvent.click(cpuOption);

        fireEvent.change(memoryInput, { target: { value: '524288' } });
        fireEvent.click(gpuCheckbox);
        fireEvent.click(submitButton);
        expect(screen.getByText(ServerModels.HIGH_DENSITY_SERVER)).toBeInTheDocument();
    });

    // Rule 2: Mainframe can only be built with Power CPU, memory size
    // limitation is applied on Rule 4. And Power CPU can build
    // other Server Models except High Density.
    it('shows correct server models for inputs for rule 2', () => {
        const { cpuSelect, memoryInput, submitButton } = renderComponent();

        fireEvent.click(cpuSelect);
        const cpuOption = screen.getByText(CPUModel.POWER);
        fireEvent.click(cpuOption);

        fireEvent.change(memoryInput, { target: { value: '4096' } });
        fireEvent.click(submitButton);
        expect(screen.getByText(ServerModels.MAINFRAME)).toBeInTheDocument();
        expect(screen.getByText(ServerModels.RACK_SERVER)).toBeInTheDocument();
        expect(screen.getByText(ServerModels.TOWER_SERVER)).toBeInTheDocument();
    });


    // Rule 3a: Memory size greater or equal to 131,072MB can be both 4U
    // Rack Server and Tower Server. Lower than that can only be Tower Server.
    it('shows correct server models for inputs for rule 3a', async () => {
        const { cpuSelect, memoryInput, submitButton } = renderComponent();

        fireEvent.mouseDown(cpuSelect);
        const cpuOption = screen.getByText(CPUModel.X86);
        fireEvent.click(cpuOption);

        fireEvent.change(memoryInput, { target: { value: '131072' } });
        fireEvent.click(submitButton);
        expect(screen.getByText(ServerModels.RACK_SERVER)).toBeInTheDocument();
        expect(screen.getByText(ServerModels.TOWER_SERVER)).toBeInTheDocument();
    });

    // Rule 3b: Memory size greater or equal to 131,072MB can be both 4U
    // Rack Server and Tower Server. Lower than that can only be Tower Server.
    it('shows correct server models for inputs for rule 3b', () => {
        const { cpuSelect, memoryInput, submitButton } = renderComponent();

        fireEvent.click(cpuSelect);
        const cpuOption = screen.getByText(CPUModel.POWER);
        fireEvent.click(cpuOption);
        fireEvent.change(memoryInput, { target: { value: '4096' } });
        fireEvent.click(submitButton);
        expect(screen.getByText(ServerModels.TOWER_SERVER)).toBeInTheDocument();
    });

    // Rule 5: If there is no Server Model match the input, need to show
    // “No Options” 
    it('shows "No Options" for unsupported configurations', () => {
        const { cpuSelect, memoryInput, gpuCheckbox, submitButton } = renderComponent();

        fireEvent.click(cpuSelect);
        const cpuOption = screen.getByText(CPUModel.POWER);
        fireEvent.click(cpuOption);

        fireEvent.change(memoryInput, { target: { value: '4096' } });
        fireEvent.click(gpuCheckbox);
        fireEvent.click(submitButton);
        expect(screen.getByText(ServerModels.NO_OPTIONS)).toBeInTheDocument();
    });
});