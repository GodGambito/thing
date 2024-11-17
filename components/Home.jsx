import { Link } from 'react-router-dom'

const Home = () => {
    return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gray-900">
        <h1 className="text-4xl font-bold text-white">Bienvenido</h1>
        <div className="flex gap-4">
            <Link
            to="/three"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
            Thing-React
            </Link>
            <Link
            to="/bokeh"
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
            BokehEffect-React
            </Link>
        </div>
    </div>
)
}

export default Home;