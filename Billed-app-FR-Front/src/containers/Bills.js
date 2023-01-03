import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  //constructor de l'objet Bills
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    //selection dans le Dom du bouton new Bill
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    //si le bouton new Bill existe on lui ajoute un listener qui appel la fonction handleClickNewBill
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    //selection dans le Dom du bouton icon Eye
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    // le bouton icon Eye existe (pour tout les bouton) on lui ajoute un listener qui appel la fonction handleClickIconEye
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    //accède à la page new Bills
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    //recupère l'attribue Data bill url de l'icon passer en paramètre
    const billUrl = icon.getAttribute("data-bill-url")
    // raoute la classe show à la modal et renseigne la bonne image dans la modale
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
