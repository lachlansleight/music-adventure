export const getUrlSafeName = (name: string): string => {
    //regex to remove anything other than letters, numbers and spaces
    return name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "+");
};
