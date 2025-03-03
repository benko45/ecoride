"use strict";

import { applyTheme } from './apply-theme.js';
/******************************************************/
/******************************************************/
applyTheme();
/******************************************************/
/******************************************************/

// Initialisation du Datepicker
$(document).ready(function() {
    // Récupérer les dates stockées dans le localStorage
    let savedDate = localStorage.getItem('selectedDate');
    let savedLongDate = localStorage.getItem('longSelectedDate');

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
        localStorage.setItem('selectedDate', selectedDate);

        // Format long (DD dd MM)
        const dateObject = e.date;
        const options = { weekday: 'long', day: '2-digit', month: 'long' };
        const longSelectedDate = dateObject.toLocaleDateString('fr-FR', options);

        localStorage.setItem('longSelectedDate', longSelectedDate);

        console.log('selectedDate:', selectedDate);
        console.log('longSelectedDate:', longSelectedDate);
    });

    // Si une date est enregistrée, on la sélectionne et on la surligne
    if (savedDate) {
        $('#date-depart').datepicker('setDate', savedDate);
    } else {
        // Si aucune date n'est enregistrée, on surligne la date du jour
        $('#date-depart').datepicker('setDate', new Date());
    }
});
