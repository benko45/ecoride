"use strict";

import { applyTheme } from './apply-theme.js';
import { applyDynamicStyles} from './choosing-address.js';
import { setTempData } from './page-loader.js';

export function initChoosingDate(_, container) {
    console.log("📦 Container reçu dans initChoosingDate:", container);
    console.log("📦 Contenu HTML :", container.innerHTML);
  
    applyTheme();
  
    // Supprime les .datepicker éventuels pour forcer une reconstruction propre
    const oldPicker = container.querySelector('.datepicker');
    if (oldPicker) {
      console.warn("🧹 Suppression de l'ancien datepicker");
      oldPicker.remove();
    }
  
    initDatepicker(container);
  }
  

  function initDatepicker(container) {
    console.log("📅 Appel à initDatepicker()");
  
    const target = container.querySelector('#date-depart');
    if (!target) {
        console.warn("❌ #date-depart introuvable dans le container !");
        return;
    }

    const $picker = $(target);

    $picker.datepicker({
        format: 'D dd M',
        startDate: '0d',
        todayHighlight: true,
        language: 'fr',
        container: "#date-depart"
    }).on('changeDate', function (e) {
        const selectedDate = e.format().replace('.', '');
        setTempData('selectedDate', selectedDate);
        console.log('📅 Date sélectionnée :', selectedDate);
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const datepicker = document.querySelector('.datepicker');
          if (datepicker) {
            datepickerStyle(datepicker);
            console.log("🎨 Style appliqué avec succès !");
          } else {
            console.warn("⚠️ ⏰ Échec : aucun .datepicker trouvé dans le document !");
          }
        });
      });
      
      

    const savedDate = localStorage.getItem('selectedDate');
    dateInit(savedDate);
}

  
  

function dateInit(savedDate) {
    if (savedDate) {
        $('#date-depart').datepicker('setDate', savedDate);
    } else {
        // Si aucune date n'est enregistrée, on surligne la date du jour
        $('#date-depart').datepicker('setDate', new Date());
    }
}

export function datepickerStyle(container = document) {
    const datepicker = container.querySelector(".datepicker");
    if (!datepicker) {
        console.warn("⚠️ Aucun élément avec la classe .datepicker trouvé dans le container !");
        return;
    }
    datepicker.style.padding = "15px 0 0 30px";
    console.log("🎨 Style personnalisé appliqué au datepicker !");
}

  