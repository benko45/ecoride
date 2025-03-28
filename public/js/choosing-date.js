"use strict";

import { applyTheme } from './apply-theme.js';
import { applyDynamicStyles} from './choosing-address.js';
import { setTempData } from './handleData.js';

export function initChoosingDate() {
    applyTheme();
    const datepicker = document.querySelector('.datepicker');
    if (!datepicker) initDatepicker();
    else {
        datepicker.remove();
        initDatepicker();
    }
}

function initDatepicker() {
    // Initialisation du Datepicker
    $(document).ready(function() {
        // Récupérer les dates stockées dans le localStorage
        const savedDate = localStorage.getItem('selectedDate');

        // Configuration du Datepicker
        $('#date-depart').datepicker({
            format: 'D dd M',   // Format de la date
            startDate: '0d',    // Date minimale (aujourd'hui)
            todayHighlight: true,   // Surligne la date d'aujourd'hui
            language: 'fr',     // Langue en français
            container: '#date-depart'
        }).on('changeDate', function(e) {

                // Format court
            let selectedDate = e.format();
            selectedDate = selectedDate.replace('.', '');  // Supprime le point après le jour
            setTempData('selectedDate', selectedDate);
            // Format long (DD dd MM)
            // const dateObject = e.date;
            // const options = { weekday: 'long', day: '2-digit', month: 'long' };
            // const longSelectedDate = dateObject.toLocaleDateString('fr-FR', options);
            // localStorage.setItem('longSelectedDate', longSelectedDate);

            console.log('selectedDate:', selectedDate);
            // console.log('longSelectedDate:', longSelectedDate);
        });

        // Si une date est enregistrée, on la sélectionne et on la surligne
        dateInit(savedDate)
        // On décore le datepicker
        datepickerStyle();
    });
}

function dateInit(savedDate) {
    if (savedDate) {
        $('#date-depart').datepicker('setDate', savedDate);
    } else {
        // Si aucune date n'est enregistrée, on surligne la date du jour
        $('#date-depart').datepicker('setDate', new Date());
    }
}

function datepickerStyle() {
    const datePickers = document.getElementsByClassName('datepicker');
    if (datePickers.length > 0) {
        Array.from(datePickers).forEach(el => applyDynamicStyles(el));
    } else {
        console.warn('Aucun datepicker trouvé !');
    }
}