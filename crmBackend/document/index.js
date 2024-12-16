module.exports = (factureData, customers) => {
   const today = new Date();
   return `
       <!doctype html>
       <html>
          <head>
             <meta charset="utf-8">
             <title>PDF Result Template</title>
             <style>
                 body {
                     font-family: Arial, sans-serif;
                     line-height: 1.6;
                     color: #333;
                     margin: 0;
                     padding: 0;
                 }

                 .invoice-box {
                     max-width: 800px;
                     margin: auto;
                     padding: 20px;
                     border: 1px solid #eee;
                     box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                     background-color: #fff;
                 }

                 h2 {
                     color: #007BFF;
                     border-bottom: 2px solid #007BFF;
                     padding-bottom: 5px;
                     margin-bottom: 15px;
                 }

                 p {
                     margin: 5px 0;
                 }

                 p span {
                     font-weight: bold;
                 }

                 .invoice-box p {
                     padding: 5px 0;
                     border-bottom: 1px solid #eee;
                 }

                 .invoice-box p:last-child {
                     border-bottom: none;
                 }

                 .customer-details, .invoice-details {
                     margin-top: 20px;
                 }

                 .customer-details p, .invoice-details p {
                     margin-bottom: 10px;
                 }
             </style>
          </head>
          <body>
             <div class="invoice-box">
                <h2>Command ${factureData.description_commande}</h2>
                <h2>Date de Création  ${today}</h2>
                <p>
                    <span>ID:</span> ${factureData.idcommande}<br />
                    <span>Date:</span> ${factureData.date_commande}<br />
                    <span>Total Amount:</span> ${factureData.montant_total_commande}<br />
                    <span>Address:</span> ${factureData.adresselivraison_commande}<br />
                    <span>Payment Method:</span> ${factureData.modepaiement_commande}<br />
                    <span>Status:</span> ${factureData.statut_commande}<br />
                    <span>Delivery Date:</span> ${factureData.date_livraison_commande}<br />
                    <span>Delivery Method:</span> ${factureData.metho_delivraison_commande}<br />
                </p>
                <h2>Invoice Details</h2>
                <p>
                   <span>ID:</span> ${factureData.idfacture}<br>
                   <span>Date:</span> ${factureData.date_facture}<br>
                   <span>Status:</span> ${factureData.etat_facture}<br>
                   <span>Total Amount:</span> ${factureData.montant_total_facture}<br>
                   <span>Payment Method:</span> ${factureData.methode_paiment_facture}<br>
                   <span>Due Date:</span> ${factureData.date_echeance}<br>
                   <span>Payment Status:</span> ${factureData.statut_paiement_facture}<br>
                </p>

                <h2>Customer Details</h2>
                ${customers.map(customer => `
                   <p>
                       <span>ID:</span> ${customer.idclient}<br>
                       <span>Name:</span> ${customer.nom_client} ${customer.prenom_client}<br>
                       <span>Phone:</span> ${customer.telephone_client}<br>
                       <span>Address:</span> ${customer.adresse_client}<br>
                       <span>Email:</span> ${customer.email_client}<br>
                       <span>Genre:</span> ${customer.genre_client}<br>
                       <span>Date of Birth:</span> ${customer.datede_naissance_client}<br>
                   </p>
                `).join('')}
             </div>
          </body>
       </html>
   `;
};

