//this type holds the info of a row from LettersShared.csv
export interface LettersSharedRow {
    letter_name: string;
    key_color: string;
}

//Modal Dimensions extrapolated all the way from LetterGrid.tsx
export interface ModalDimensions{
    start_width: number;
    start_height: number;
    end_width: number;
    end_height: number;
    start_pos: [number, number];
    end_pos: [number, number]; 
}

export const createEmptyModalDims = (): ModalDimensions => ({
    start_width: 0,
    start_height: 0,
    end_width: 0,
    end_height: 0,
    start_pos: [0, 0],
    end_pos: [0, 0]
});


export interface DiceContainerDimensions{
    width: number;
    height: number;
    x: number;
    y: number;
}

export const createEmptyDiceContainerDims = (): DiceContainerDimensions => ({
    width: 0,
    height: 0,
    x: 0,
    y: 0
});


export interface LetterDisplay{
    display: string|undefined;
    font: string|undefined;
}

export const createEmptyLetterDisplay = (): LetterDisplay => ({
    display: "",
    font: "",
});