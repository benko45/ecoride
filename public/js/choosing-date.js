"use strict";

import { applyTheme } from './apply-theme.js';
import { applyDynamicStyles } from './choosing-address.js';
import { setTempData } from './handleData.js';

export function initChoosingDate(container = document) {
    applyTheme(container);
    const datepicker = container.querySelector('.datepicker');
    if (!datepicker) initDatepicker(container);
    else {
        datepicker.remove();
        initDatepicker(container);
    }
}

function initDatepicker(container = document) {
    let dateHasBeenSelected = false;

    $(document).ready(function () {
        const savedDate = localStorage.getItem('selectedDate');
        console.log('initDatepicker: savedDate:', savedDate);

        $('#date-depart').datepicker({
            format: 'D dd M',
            startDate: '0d',
            todayHighlight: true,
            language: 'fr',
            container: '#date-depart'
        }).on('changeDate', function (e) {
            if (!dateHasBeenSelected) {
                dateHasBeenSelected = true;
            } else {
                const selectedDate = formatDateToLocalISO(e.date);
                console.log('📥 selectedDate enregistré :', selectedDate);
                setTempData('selectedDate', selectedDate);
            }
        });

        dateInit(savedDate);
        datepickerStyle(container);
    });
}

function dateInit(savedDate) {
    console.log("🧪 dateInit: savedDate:", savedDate);

    if (savedDate) {
        // Convertit l'ISO local en date JS locale sans décalage UTC
        const [year, month, day] = savedDate.split('-');
        const localDate = new Date(Number(year), Number(month) - 1, Number(day));
        $('#date-depart').datepicker('setDate', localDate);
    } else {
        const today = new Date();
        $('#date-depart').datepicker('setDate', today);
    }
}

function datepickerStyle(container = document) {
    const datePickers = container.getElementsByClassName('datepicker');
    if (datePickers.length > 0) {
        Array.from(datePickers).forEach(el => applyDynamicStyles(el));
    } else {
        console.warn('Aucun datepicker trouvé !');
    }
}

export function formatDateToLocalISO(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
