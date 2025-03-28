/*****************************************************/
/*            Gestion des input data                 */
/*****************************************************/
const tempData = {
    selectedDepartureAddress: null,
    selectedArrivalAddress: null,
    selectedDate: null,
    selectedPassengers: null
};

export function applyTempDataToLocalStorage() {
    if (tempData.selectedDepartureAddress) {
        localStorage.setItem("selectedDepartureAddress", tempData.selectedDepartureAddress);
    }
    if(tempData.selectedArrivalAddress) {
        localStorage.setItem("selectedArrivalAddress", tempData.selectedArrivalAddress);
    }
    if (tempData.selectedDate) {
        localStorage.setItem("selectedDate", tempData.selectedDate);
    }
    if (tempData.selectedPassengers) {
        localStorage.setItem("selectedPassengers", tempData.selectedPassengers);
    }
    console.log("💾 Données temporaires transférées dans localStorage");
}

export function setTempData(key, value) {
    if (key in tempData) {
        tempData[key] = value;
    } else {
        console.warn(`❗ Clé inconnue dans tempData : ${key}`);
    }
}

export function resetTempData() {
    tempData.selectedDepartureAddress = null;
    tempData.selectedArrivalAddress = null;
    tempData.selectedDate = null;
    tempData.selectedPassengers = null;
    // console.log("🗑️ Données temporaires effacées");
}