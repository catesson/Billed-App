import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  //constructor de l'objet newBill
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    //recupere le formulaire de new Bill dans le Dom 
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    //ajout un listener sur le bouton envoyer du formulaire et appel la fonction handleSubmit
    formNewBill.addEventListener("submit", this.handleSubmit)
    //recupère l'input dont le data-testid est "file" dans le DOM
    const file = this.document.querySelector(`input[data-testid="file"]`)
     //ajout un listener sur l'input  et appel la fonction handleChangeFile
    file.addEventListener("change", this.handleChangeFile)
    //déclare fileUrl et lui donne la valeur null
    this.fileUrl = null
    //déclare fileName et lui donne la valeur null
    this.fileName = null
    //déclare billId et lui donne la valeur null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  //fonction handleChangeFile (qui est appeler sur le input "file")
  handleChangeFile = e => {
    //annulation du comportement par défaut du bouton 
    e.preventDefault()
    //recupère l'input dont le data-testid est "file" dans le DOM    
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0] 
    //recupération des information concernant le fichier envoyer via l'input
    const filePath = e.target.value.split(/\\/g)    
    // récupération du nom du fichier
    const fileName = filePath[filePath.length-1]    
    // déclaration de l'objet formData
    const formData = new FormData()    
    //test du format du fichier passer en paramêtre (si pas valide on supprime le fichier)
    if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png') {
      this.document.querySelector(`input[data-testid="file"]`).value = null
      //pour verifier les test on ajoute un fichier appeler invlide
      this.document.querySelector(`input[data-testid="file"]`).files = [new File([],"invalide")]}
      
    // récupération de l'email de l'utilisateur
    const email = JSON.parse(localStorage.getItem("user")).email
    //ajout de l'attribue file et email à l'objet formData
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }

  handleSubmit = e => {
    //annulation du comportement par défaut du bouton 
    e.preventDefault()
    //test dans la console
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    // récupération de l'email de l'utilisateur
    const email = JSON.parse(localStorage.getItem("user")).email
    //création du bill avec les donnée contenue dans le formulaire
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    // utilisation de la fonction qui ajoute le nouveau bill dans la base de donnée
    this.updateBill(bill)
    // utilise le routeur pour aller sur la page des Bills.
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}