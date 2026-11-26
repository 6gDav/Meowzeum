export const emilSendTime = () =>
    new Date().toLocaleString("en-GB", {
        timeZone: "Europe/Budapest",
        dateStyle: "medium",
        timeStyle: "short",
    });