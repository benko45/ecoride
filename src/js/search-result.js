import { adjustLine_1_ItemWidth } from './search-result-functions.js';

"use strict";

const applyThemeWrapper = async () => {
    const { applyTheme } = await import('./apply-theme.js');
    applyTheme();
};

window.addEventListener('DOMContentLoaded', applyThemeWrapper);

function s(nb){
    return nb > 1 ? 's' : '';
}

const filterDepartureAddress = document.getElementById('filter-departure-address');
const filterArrivalAddress = document.getElementById('filter-arrival-address');
const filterDate = document.getElementById('filter-date');
const filterPassengersNb = document.getElementById('filter-passengers-nb');

filterDepartureAddress.innerHTML = localStorage.getItem('selectedDepartureAddress');
filterArrivalAddress.innerHTML = localStorage.getItem('selectedArrivalAddress');
filterDate.innerHTML = localStorage.getItem('selectedDate');
filterPassengersNb.innerHTML = ', ' + localStorage.getItem('selectedPassengers') + ' passager' + s(localStorage.getItem('selectedPassengers'));

// Ajuste la largeur des éléments de filtre : windwow.innerWidth / 2 - 50px
adjustLine_1_ItemWidth([filterDepartureAddress, filterArrivalAddress], 50);

// click sur filter container
document.getElementById('filter-container').addEventListener('click', function() {
    window.location.href = '../../index.html';
});






