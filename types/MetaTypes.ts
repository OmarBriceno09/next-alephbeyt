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
    start_center: [number, number];
    end_center: [number, number]; 
}

export const createEmptyModalDims = (): ModalDimensions => ({
    start_width: 0,
    start_height: 0,
    end_width: 0,
    end_height: 0,
    start_center: [0, 0],
    end_center: [0, 0]
  });

export interface LetterDisplay{
    display: string|undefined;
    font: string|undefined;
}

export const createEmptyLetterDisplay = (): LetterDisplay => ({
    display: "",
    font: "",
});

//for hex saturation
export const hexToHsl = (hex: string, saturation = 85, lightness = 45): string => {
  let r = 0, g = 0, b = 0;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const d = max - min;

  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }

  // Clamp saturation/lightness to readable values
  return `hsl(${h}, ${saturation}%, ${lightness}%)`;
}