import { useNavigate } from 'react-router-dom'
import { MapPin, Users, BarChart3, CheckCircle, Globe, Shield, TrendingUp, Clock } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Géolocalisation Avancée',
      description: 'Collectez des données précises avec des coordonnées GPS et visualisez-les sur une carte interactive.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Gestion d\'Équipes',
      description: 'Organisez vos agents de terrain en équipes et assignez des sondages facilement.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analyses Puissantes',
      description: 'Visualisez vos résultats avec des graphiques interactifs et exportez vos données.'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Types de Questions Variés',
      description: 'Questions à choix multiples, échelles, upload de fichiers, captures photo/vidéo et plus encore.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-secteurs',
      description: 'Adapté à tous les secteurs : santé, éducation, agriculture, commerce et plus.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Sécurisé et Fiable',
      description: 'Vos données sont protégées avec un système d\'authentification robuste.'
    }
  ]

  const stats = [
    { icon: <Users className="w-8 h-8" />, value: '500+', label: 'Agents de Terrain' },
    { icon: <MapPin className="w-8 h-8" />, value: '10k+', label: 'Points Collectés' },
    { icon: <CheckCircle className="w-8 h-8" />, value: '98%', label: 'Satisfaction Client' },
    { icon: <Clock className="w-8 h-8" />, value: '24/7', label: 'Support Disponible' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/images/logolight.png" 
                alt="G-Survey Logo" 
                className="w-14 h-14 object-cover rounded-full" 
                />
              <span className="ml-2 text-2xl font-bold text-primary-900">G-Survey</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-primary-900 hover:from-primary-900 font-medium transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-500 font-medium transition-colors shadow-md"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-900 to-primary-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Transformez Votre Collecte de Données de Terrain
              </h1>
              <p className="text-xl mb-8 text-primary-50">
                G-Survey est la solution complète pour la gestion de sondages géolocalisés. 
                Collectez, analysez et visualisez vos données en temps réel.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white text-primary-900 border-2 hover:border-white-900 rounded-lg hover:bg-blue-900 hover:text-white font-semibold transition-colors shadow-lg"
                >
                  Commencer Gratuitement
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-900 font-semibold transition-colors"
                >
                  Démo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg overflow-hidden relative flex items-center justify-center">
                  <img 
                      src="/images/gsurvey.png" 
                      alt="map" 
                      className="absolute inset-0 w-[600px] h-[400px]object-cover opacity-100" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="relative rounded-lg pt-20 pb-19 text-center overflow-hidden object-cover">
                    <img 
                      src="/images/agent.jpg" 
                      alt="map" 
                      className="absolute inset-0  w-[600px] h-[125px] object-cover opacity-100"
                      />
                      <p className="mt-2 text-center text-xs font-medium text-gray-700">Agents</p>
                  </div>
                  
                  <div className="relative rounded-lg p-9 text-center overflow-hidden">
                    <img 
                      src="/images/geoloc.png" 
                      alt="map" 
                      className="absolute inset-0  w-[600px] h-[125px] object-cover opacity-100" />
                    <p className="text-xs font-medium text-gray-700">Géolocalisation</p>
                  </div>
                  <div className="relative rounded-lg p-4 text-center overflow-hidden">
                    <img 
                      src="/images/geodata.png" 
                      alt="map" 
                      className="absolute inset-0  w-[600px] h-[125px] object-cover opacity-100" />
                    <p className="text-xs font-medium text-gray-700">Analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center text-primary-900 mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Une plateforme complète avec tous les outils dont vous avez besoin pour 
              réussir vos collectes de données sur le terrain.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-primary-900 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ils Nous Font Confiance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Découvrez ce que nos clients satisfaits disent de G-Survey
            </p>
          </div >
          <div className="grid md:grid-cols-3 gap-8">
             <div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <img 
                    src="/images/environnement.png" 
                    alt="image de l'ong" 
                    className="w-20 h-20 object-cover rounded-full" 
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900 dark:text-white">Dr. Sophie Diallo, Directrice Programmes Environnementaux</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gardien Vert International</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  "Pour nos projets de conservation et d'agriculture durable, la mesure précise des superficies agricoles et le suivi de l'évolution des écosystèmes sont fondamentaux. G-Survey, notamment avec sa capacité à intégrer les données de drones, a été un game-changer. Nous pouvons désormais cartographier des zones vastes, documenter la biodiversité et suivre la déforestation avec une précision et une rapidité que nous n'avions jamais atteintes auparavant. C'est l'outil parfait pour nos équipes de terrain."
                </p>
                <div className="flex mt-4 text-yellow-500">
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
             </div>
             <div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <img 
                    src="/images/bank.png" 
                    alt="image bank capitalis" 
                    className="w-20 h-20 object-cover rounded-full" 
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900 dark:text-white">Jean-Luc Dubois, Responsable Expérience Client</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Capitalis Finance</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  "La satisfaction client est notre priorité. G-Survey nous a permis de digitaliser nos enquêtes CSAT et NPS auprès de nos clients bancaires, que ce soit en agence ou sur le terrain pour nos conseillers mobiles. La facilité de déploiement des sondages, la sécurisation des données et l'analyse rapide des retours nous donnent une vision claire et instantanée de l'expérience client. C'est un atout majeur pour améliorer continuellement nos services et fidéliser notre clientèle."
                </p>
                <div className="flex mt-4 text-yellow-500">
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
             </div>
             <div>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <img 
                    src="/images/ong.png" 
                    alt="image de l'ong" 
                    className="w-20 h-20 object-cover rounded-full" 
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900 dark:text-white">Fatoumata Kourouma, Cheffe de Projet</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Yêléma-Bénin</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  "En tant qu'organisation œuvrant pour le développement communautaire, la précision des données et le suivi en temps réel sont cruciaux. G-Survey a révolutionné nos enquêtes sur la pauvreté. La géolocalisation des ménages vulnérables et la collecte multimédia nous permettent de mieux cibler nos aides et de mesurer l'impact de nos programmes avec une efficacité inégalée. Un outil indispensable pour faire une réelle différence sur le terrain."
                </p>
                <div className="flex mt-4 text-yellow-500">
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-900 to-primary-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl text-primary-50 mb-8">
            Rejoignez des centaines d'organisations qui utilisent déjà G-Survey pour 
            améliorer leur collecte de données.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-primary-900 rounded-lg hover:bg-gray-100 font-semibold transition-colors shadow-lg text-lg"
          >
            Créer un Compte Gratuit
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                src="/images/logolight.png" 
                alt="G-Survey Logo" 
                className="w-14 h-14  rounded-full object-cover" 
                />
                <span className="ml-2 text-xl font-bold">G-Survey</span>
              </div>
              <p className="text-gray-400">
                La plateforme de sondages géolocalisés pour professionnels.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => navigate('/terms')}
                    className="hover:text-white transition-colors"
                  >
                    Conditions d'utilisation
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/privacy')}
                    className="hover:text-white transition-colors"
                  >
                    Politique de confidentialité
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contactez-nous */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-white">Nous contacter</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  📞 Téléphone :
                  <a href="tel:+2250102030405" className="ml-2 hover:text-white transition-colors">+225 07 89 45 81 02</a>
                </li>
                <li>
                  ✉️ Email :
                  <a href="mailto:ygouhean@gmail.com" className="ml-2 hover:text-white transition-colors">contact@gsurvey.com</a>
                </li>
                <li>
                  📍 Adresse : Abidjan, Côte d'Ivoire
                </li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3 text-white">Nos réseaux sociaux</h3>
              <div className="flex items-center gap-5 text-gray-300">
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="inline-block align-middle">
                    <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.241l-1.918.001c-1.504 0-1.796.715-1.796 1.765v2.315h3.59l-.467 3.622h-3.123V24h6.127C23.403 24 24 23.403 24 22.676V1.325C24 .597 23.403 0 22.675 0z"/>
                  </svg>
                </a>
                {/* Twitter/X */}
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="inline-block align-middle">
                    <path d="M18.244 2H21.5l-7.61 8.69L23.5 22h-7.297l-5.708-6.64L3.5 22H.244l8.165-9.325L.5 2h7.4l5.163 6.014L18.244 2Zm-1.277 18h2.002L7.1 4H5.03l11.936 16Z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="inline-block align-middle">
                    <path d="M20.447 20.452H17.21V14.89c0-1.325-.024-3.028-1.845-3.028-1.848 0-2.131 1.442-2.131 2.932v5.658H9.001V9h3.111v1.561h.045c.434-.82 1.494-1.684 3.074-1.684 3.29 0 3.896 2.164 3.896 4.979v6.596zM5.337 7.433a1.81 1.81 0 1 1 0-3.62 1.81 1.81 0 0 1 0 3.62zM6.963 20.452H3.708V9h3.255v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" className="inline-block align-middle">
                    <path d="M23.498 6.186a2.998 2.998 0 0 0-2.113-2.12C19.658 3.5 12 3.5 12 3.5s-7.658 0-9.385.566A2.998 2.998 0 0 0 .502 6.186C0 7.917 0 12 0 12s0 4.083.502 5.814a2.998 2.998 0 0 0 2.113 2.12C4.342 20.5 12 20.5 12 20.5s7.658 0 9.385-.566a2.998 2.998 0 0 0 2.113-2.12C24 16.083 24 12 24 12s0-4.083-.502-5.814ZM9.75 15.568V8.432L15.818 12 9.75 15.568Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 G-Survey. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


