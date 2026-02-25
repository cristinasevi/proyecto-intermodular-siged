export default function Button({children, onClick}) {
    return (
        <button onClick={onClick} className="bg-blue-900 opacity-80 text-white px-6 py-2 rounded-md hover:bg-blue-800 cursor-pointer">
            {children}
        </button>
    );
}

export function ButtonDelete({children, onClick}) {
    return (
        <button onClick={onClick} className="bg-red-600 opacity-80 text-white px-6 py-2 rounded-md hover:bg-red-700 cursor-pointer">
            {children}
        </button>
    );
}
