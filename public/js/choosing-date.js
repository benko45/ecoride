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
                let selectedDate = e.format();
                selectedDate = selectedDate.replace('.', '').toLowerCase();
                setTempData('selectedDate', selectedDate);
                console.log('selectedDate:', selectedDate);
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

    const formatDateForPicker = (date) => {
        const options = { weekday: 'short', day: '2-digit', month: 'short' };
        return date.toLocaleDateString('fr-FR', options).replace('.', '').toLowerCase();
    };

    if (savedDate === "Aujourd'hui") {
        const today = new Date();
        const formatted = formatDateForPicker(today);
        console.log("📆 Date 'Aujourd'hui' →", formatted);
        $('#date-depart').datepicker('setDate', formatted);
    } else if (savedDate === "Demain") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formatted = formatDateForPicker(tomorrow);
        console.log("📆 Date 'Demain' →", formatted);
        $('#date-depart').datepicker('setDate', formatted);
    } else if (savedDate === "Après-demain") {
        const overmorrow = new Date();
        overmorrow.setDate(overmorrow.getDate() + 2);
        const formatted = formatDateForPicker(overmorrow);
        console.log("📆 Date 'Après-demain' →", formatted);
        $('#date-depart').datepicker('setDate', formatted);
    } else if (savedDate) {
        $('#date-depart').datepicker('setDate', savedDate);
    } else {
        $('#date-depart').datepicker('setDate', new Date());
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