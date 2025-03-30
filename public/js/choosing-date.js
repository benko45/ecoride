"use strict";

import { applyTheme } from './apply-theme.js';
import { applyDynamicStyles} from './choosing-address.js';
import { setTempData } from './handleData.js';

export function initChoosingDate(container=document) {
    applyTheme(container);
    const datepicker = container.querySelector('.datepicker');
    if (!datepicker) initDatepicker(container);
    else {
        datepicker.remove();
        initDatepicker(container);
    }
}

function initDatepicker(container=document) {
    let dateHasBeenSelected = false;
    // Initialisation du Datepicker
    $(document).ready(function() {
        // Récupérer les dates stockées dans le localStorage
        const savedDate = localStorage.getItem('selectedDate');
        console.log('initDatepicker: savedDate:', savedDate);
        // Configuration du Datepicker
        $('#date-depart').datepicker({
            format: 'D dd M',   // Format de la date
            startDate: '0d',    // Date minimale (aujourd'hui)
            todayHighlight: true,   // Surligne la date d'aujourd'hui
            language: 'fr',     // Langue en français
            container: '#date-depart'
        }).on('changeDate', function(e) {
            if (!dateHasBeenSelected) {
                dateHasBeenSelected = true; // ✅ première interaction réelle
            } else {
                let selectedDate = e.date; // Date JS native
                const options = { weekday: 'short', day: '2-digit', month: 'short' };
                selectedDate = selectedDate.toLocaleDateString('fr-FR', options).replace('.', '').toLowerCase();
                setTempData('selectedDate', selectedDate);
                console.log('📥 selectedDate enregistré :', selectedDate);
            }
        });

        // Si une date est enregistrée, on la sélectionne et on la surligne
        dateInit(savedDate)
        // On décore le datepicker
        datepickerStyle(container);
    });
}

function dateInit(savedDate) {
    console.log("🧪 dateInit: savedDate:", savedDate);

    if (savedDate) {
        $('#date-depart').datepicker('setDate', savedDate);
    } else {
        const today = new Date();
        const options = { weekday: 'short', day: '2-digit', month: 'short' };
        const todayFormatted = today.toLocaleDateString('fr-FR', options).replace('.', '').toLowerCase();
        localStorage.setItem('selectedDate', todayFormatted);
        $('#date-depart').datepicker('setDate', todayFormatted);
        console.log("📆 Aucun savedDate → fallback aujourd’hui :", todayFormatted);
    }
}



function datepickerStyle(container=document) {
    const datePickers = container.getElementsByClassName('datepicker');
    if (datePickers.length > 0) {
        Array.from(datePickers).forEach(el => applyDynamicStyles(el));
    } else {
        console.warn('Aucun datepicker trouvé !');
    }
}