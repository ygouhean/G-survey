import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <MapPin className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-primary-600">G-Survey</span>
            </Link>
            <Link 
              to="/login"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Dernière mise à jour : 2 novembre 2025
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Chez G-Survey, nous prenons très au sérieux la protection de vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, 
                partageons et protégeons vos informations lorsque vous utilisez notre plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Données que Nous Collectons
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous collectons les types de données suivants :
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.1 Informations d'Inscription
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Nom et prénoms</li>
                <li>Adresse e-mail</li>
                <li>Nom d'utilisateur</li>
                <li>Mot de passe (crypté)</li>
                <li>Genre</li>
                <li>Pays</li>
                <li>Secteur d'activité et type d'organisation</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.2 Données de Sondage
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Réponses aux questionnaires</li>
                <li>Données de géolocalisation (coordonnées GPS)</li>
                <li>Photos, vidéos et fichiers téléchargés</li>
                <li>Date et heure de collecte</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.3 Données d'Utilisation
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Adresse IP</li>
                <li>Type de navigateur et appareil</li>
                <li>Pages consultées et actions effectuées</li>
                <li>Dates et heures d'accès</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Comment Nous Utilisons Vos Données
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous utilisons vos données pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte et vos préférences</li>
                <li>Traiter et analyser les données de sondage</li>
                <li>Communiquer avec vous concernant votre compte</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
                <li>Améliorer l'expérience utilisateur</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Partage de Vos Données
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous ne vendons pas vos données personnelles. Nous pouvons partager vos données 
                uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>
                  <strong>Au sein de votre organisation :</strong> Les données de sondage sont 
                  partagées avec les membres autorisés de votre équipe
                </li>
                <li>
                  <strong>Prestataires de services :</strong> Fournisseurs d'hébergement et 
                  services techniques nécessaires au fonctionnement de la plateforme
                </li>
                <li>
                  <strong>Obligations légales :</strong> Lorsque la loi nous l'impose ou pour 
                  protéger nos droits
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Sécurité des Données
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos 
                données contre tout accès, modification, divulgation ou destruction non autorisés :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Chiffrement des mots de passe</li>
                <li>Connexions HTTPS sécurisées</li>
                <li>Contrôle d'accès basé sur les rôles</li>
                <li>Sauvegardes régulières</li>
                <li>Surveillance de la sécurité</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Conservation des Données
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour 
                fournir nos services et respecter nos obligations légales. Vous pouvez demander 
                la suppression de votre compte à tout moment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Vos Droits
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Conformément aux lois sur la protection des données, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li><strong>Droit d'accès :</strong> Accéder à vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> Demander la limitation du traitement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Cookies et Technologies Similaires
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous utilisons des cookies et des technologies similaires pour améliorer votre 
                expérience sur notre plateforme. Les cookies nous aident à :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Maintenir votre session connectée</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser l'utilisation de la plateforme</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vous pouvez gérer les cookies via les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Transferts Internationaux
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vos données peuvent être transférées et stockées sur des serveurs situés dans 
                différents pays. Nous nous assurons que ces transferts respectent les normes 
                internationales de protection des données.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Modifications de Cette Politique
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
                Nous vous informerons de tout changement important par e-mail ou via une notification 
                sur la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Contact
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer 
                vos droits, veuillez nous contacter à :
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email :</strong> privacy@gsurvey.com<br />
                  <strong>Téléphone :</strong> +33 1 23 45 67 89<br />
                  <strong>Délégué à la Protection des Données :</strong> dpo@gsurvey.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


