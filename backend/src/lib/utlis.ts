export const parseValidNumber = (number: any) => {
    const parsedNumber = Number(number);
    return Number.isNaN(parsedNumber) ? null : parsedNumber;
}