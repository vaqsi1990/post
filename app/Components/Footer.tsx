import React from 'react'

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-black mt-14 md:mt-0 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-white text-sm">
                        <p>© {currentYear} All rights reserved</p>
                    </div>
                    <div className="text-gray-400 text-sm">
                        <p>Made with care</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
