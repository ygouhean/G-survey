import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/images/logolight.png" 
              alt="G-Survey Logo" 
              className="w-10 h-10 object-cover rounded-full" 
              /> 
              <span className="ml-2 text-2xl font-bold text-primary-900">G-Survey</span>
            </Link>
            <Link 
              to="/login"
              className="flex items-center text-primary-900 hover:text-primary-700 font-medium transition-colors"
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
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-4">
            Conditions d'Utilisation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Dernière mise à jour : 2 novembre 2025
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                1. Acceptation des Conditions
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                En accédant et en utilisant G-Survey (ci-après "la Plateforme"), vous acceptez 
                d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
                veuillez ne pas utiliser la Plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                2. Description du Service
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                G-Survey est une plateforme de gestion de sondages géolocalisés qui permet aux 
                organisations de :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Créer et gérer des sondages personnalisés</li>
                <li>Collecter des données géolocalisées sur le terrain</li>
                <li>Organiser des équipes d'agents de terrain</li>
                <li>Analyser et visualiser les résultats en temps réel</li>
                <li>Exporter les données collectées</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                3. Compte Utilisateur
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Pour utiliser certaines fonctionnalités de la Plateforme, vous devez créer un compte. 
                Vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la sécurité de votre mot de passe</li>
                <li>Ne pas partager votre compte avec des tiers</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                4. Utilisation Acceptable
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vous vous engagez à ne pas :
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Utiliser la Plateforme à des fins illégales ou non autorisées</li>
                <li>Violer les droits de propriété intellectuelle</li>
                <li>Transmettre des virus ou du code malveillant</li>
                <li>Tenter d'accéder de manière non autorisée à nos systèmes</li>
                <li>Collecter des données d'autres utilisateurs sans autorisation</li>
                <li>Harceler, menacer ou diffamer d'autres utilisateurs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                5. Propriété Intellectuelle
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Tous les droits de propriété intellectuelle relatifs à la Plateforme, y compris 
                le code source, les logos, les graphiques et le contenu, appartiennent à G-Survey 
                ou à ses concédants de licence.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vous conservez tous les droits sur les données que vous créez ou téléchargez sur 
                la Plateforme, mais vous nous accordez une licence pour les utiliser dans le cadre 
                de la fourniture de nos services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                6. Protection des Données
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous nous engageons à protéger vos données personnelles conformément à notre 
                Politique de Confidentialité et aux lois applicables en matière de protection 
                des données.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                7. Limitation de Responsabilité
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                La Plateforme est fournie "en l'état" sans garantie d'aucune sorte. 
                Nous ne serons pas responsables des dommages directs, indirects, accessoires ou 
                consécutifs résultant de votre utilisation de la Plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                8. Modification des Conditions
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications entreront en vigueur dès leur publication sur la Plateforme. 
                Votre utilisation continue de la Plateforme après la publication des modifications 
                constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                9. Résiliation
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nous pouvons suspendre ou résilier votre compte à tout moment si vous violez 
                ces conditions d'utilisation. Vous pouvez également résilier votre compte à 
                tout moment en nous contactant.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                10. Droit Applicable
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Ces conditions sont régies par les lois en vigueur dans le pays où G-Survey 
                est enregistré. Tout litige sera soumis à la juridiction exclusive des 
                tribunaux compétents.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 dark:text-white mb-4">
                11. Contact
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Pour toute question concernant ces conditions d'utilisation, veuillez nous 
                contacter à :
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email :</strong> contact@gsurvey.com<br />
                  <strong>Téléphone :</strong> +33 1 23 45 67 89
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


