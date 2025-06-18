
// Font configuration for pdfMake with Arabic support
export const createFontConfig = () => {
  return {
    Roboto: {
      normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
      bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
      italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
      bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
    },
    NotoSansArabic: {
      normal: '/fonts/noto-sans-arabic-regular.ttf',
      bold: '/fonts/noto-sans-arabic-regular.ttf',
      italics: '/fonts/noto-sans-arabic-regular.ttf',
      bolditalics: '/fonts/noto-sans-arabic-regular.ttf'
    },
    Amiri: {
      normal: '/fonts/amiri-regular.ttf',
      bold: '/fonts/amiri-regular.ttf',
      italics: '/fonts/amiri-regular.ttf',
      bolditalics: '/fonts/amiri-regular.ttf'
    }
  };
};
