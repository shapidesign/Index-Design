import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, MapPin } from 'lucide-react';
import TetrisShape from '@/components/tetris/TetrisShape';

// Helper to get flag image path
const getFlagPath = (countryName) => {
    if (!countryName) return null;
    
    // Map Hebrew/English country names to flag codes
    const countryMap = {
        'ישראל': 'il',
        'Israel': 'il',
        'ארה"ב': 'us',
        'USA': 'us',
        'United States': 'us',
        'בריטניה': 'uk',
        'UK': 'uk',
        'United Kingdom': 'uk',
        'צרפת': 'fr',
        'France': 'fr',
        'גרמניה': 'de',
        'Germany': 'de',
        'יפן': 'jp',
        'Japan': 'jp',
        'איטליה': 'it',
        'Italy': 'it',
        'הולנד': 'nl',
        'Netherlands': 'nl',
        'שוויץ': 'ch',
        'Switzerland': 'ch',
        'ספרד': 'es',
        'Spain': 'es',
        'סין': 'cn',
        'China': 'cn',
        'אירופה': 'eu',
        'Europe': 'eu',

        // Europe
        'רוסיה': 'ru', 'Russia': 'ru',
        'שוודיה': 'se', 'Sweden': 'se',
        'נורווגיה': 'no', 'Norway': 'no',
        'דנמרק': 'dk', 'Denmark': 'dk',
        'פינלנד': 'fi', 'Finland': 'fi',
        'פולין': 'pl', 'Poland': 'pl',
        'אוסטריה': 'at', 'Austria': 'at',
        'בלגיה': 'be', 'Belgium': 'be',
        'פורטוגל': 'pt', 'Portugal': 'pt',
        'יוון': 'gr', 'Greece': 'gr',
        'טורקיה': 'tr', 'Turkey': 'tr',
        'צ׳כיה': 'cz', 'Czech Republic': 'cz',
        'הונגריה': 'hu', 'Hungary': 'hu',
        'רומניה': 'ro', 'Romania': 'ro',
        'אוקראינה': 'ua', 'Ukraine': 'ua',

        // Americas
        'קנדה': 'ca', 'Canada': 'ca',
        'ברזיל': 'br', 'Brazil': 'br',
        'ארגנטינה': 'ar', 'Argentina': 'ar',
        'מקסיקו': 'mx', 'Mexico': 'mx',
        'צ׳ילה': 'cl', 'Chile': 'cl',
        'קולומביה': 'co', 'Colombia': 'co',
        'פרו': 'pe', 'Peru': 'pe',

        // Asia/Pacific
        'אוסטרליה': 'au', 'Australia': 'au',
        'הודו': 'in', 'India': 'in',
        'דרום קוריאה': 'kr', 'South Korea': 'kr',
        'טייוואן': 'tw', 'Taiwan': 'tw',
        'תאילנד': 'th', 'Thailand': 'th',
        'וייטנאם': 'vn', 'Vietnam': 'vn',
        'סינגפור': 'sg', 'Singapore': 'sg',
        'ניו זילנד': 'nz', 'New Zealand': 'nz',

        // Middle East/Africa
        'מצרים': 'eg', 'Egypt': 'eg',
        'דרום אפריקה': 'za', 'South Africa': 'za',
        'איחוד האמירויות': 'ae', 'UAE': 'ae', 'United Arab Emirates': 'ae',
        'ערב הסעודית': 'sa', 'Saudi Arabia': 'sa',
    };

    const code = countryMap[countryName];
    if (!code) return null;
    
    // Use the specific paths provided
    return `/flags/${code}.png`;
};

// Deterministic random shape and color based on string
const getRandomThumbnail = (id) => {
    const shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const colors = ['purple', 'green', 'orange', 'pink', 'yellow', 'blue', 'cyan'];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const shapeIndex = Math.abs(hash) % shapes.length;
    const colorIndex = Math.abs(hash >> 3) % colors.length;
    
    return {
        type: shapes[shapeIndex],
        color: colors[colorIndex]
    };
};

const MuseumCard = ({
    viewMode = 'gallery',
    nameHe,
    nameEn,
    description,
    country,
    type = [],
    link,
    imageUrl,
    onClick,
    id
}) => {
    const flagPath = getFlagPath(country);
    
    // Memoize the random thumbnail to keep it stable
    const thumbnail = React.useMemo(() => getRandomThumbnail(id || nameHe || 'default'), [id, nameHe]);

    if (viewMode === 'list') {
        return (
            <div 
                onClick={onClick}
                className={cn(
                'group relative flex items-center gap-4 p-3',
                'bg-off-white border-2 border-off-black',
                'shadow-brutalist-xs hover:shadow-brutalist-sm',
                'transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]',
                'overflow-hidden cursor-pointer'
            )}>
                {/* Image Thumbnail */}
                <div className="w-16 h-16 shrink-0 border-2 border-off-black overflow-hidden bg-light-gray relative">
                    {imageUrl ? (
                        <img src={imageUrl} alt={nameHe} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-off-white">
                            <TetrisShape type={thumbnail.type} size={24} color={thumbnail.color} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex flex-col">
                            <h3 className="font-shimshon font-bold text-lg truncate text-off-black leading-none">
                                {nameHe}
                            </h3>
                            {nameEn && (
                                <span className="text-xs font-pixelify text-mid-gray truncate">{nameEn}</span>
                            )}
                        </div>
                        {country && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-light-gray border border-off-black rounded text-[10px] mr-auto">
                                {flagPath && <img src={flagPath} alt={country} className="w-3 h-auto" />}
                                <span className="font-ibm truncate max-w-[80px]">{country}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-dark-gray font-ibm line-clamp-1">
                        {description}
                    </p>
                </div>

                {/* Type Tags */}
                <div className="hidden sm:flex gap-1">
                    {type.slice(0, 2).map((t) => (
                        <span key={t} className="px-2 py-0.5 text-[10px] font-shimshon bg-tetris-cyan/20 border border-off-black">
                            {t}
                        </span>
                    ))}
                </div>

                {/* Link Button */}
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            'p-2 bg-tetris-purple text-off-white',
                            'border-2 border-off-black',
                            'hover:bg-tetris-orange transition-colors'
                        )}
                        aria-label={`Visit ${nameHe}`}
                    >
                        <ExternalLink size={16} />
                    </a>
                )}
            </div>
        );
    }

    // Gallery View
    return (
        <div 
            onClick={onClick}
            className={cn(
            'group relative flex flex-col h-full',
            'bg-off-white border-3 border-off-black',
            'shadow-brutalist hover:shadow-brutalist-lg',
            'transition-all duration-200 hover:translate-x-[-4px] hover:translate-y-[-4px]',
            'overflow-hidden cursor-pointer'
        )}>
            {/* Image Container */}
            <div className="relative h-48 border-b-3 border-off-black overflow-hidden bg-light-gray group-hover:bg-tetris-blue/10 transition-colors">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={nameHe}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-off-white">
                        <TetrisShape 
                            type={thumbnail.type} 
                            size={60} 
                            color={thumbnail.color} 
                            className="opacity-80 group-hover:scale-110 transition-transform duration-300" 
                        />
                    </div>
                )}
                
                {/* Country Badge (Top Right) */}
                {country && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-off-white border-2 border-off-black shadow-sm z-10">
                        {flagPath && <img src={flagPath} alt={country} className="w-4 h-auto" />}
                        <span className="text-xs font-bold font-shimshon">{country}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col">
                <div className="flex flex-col mb-3">
                    <h3 className="text-xl font-bold font-shimshon leading-tight text-off-black group-hover:text-tetris-purple transition-colors">
                        {nameHe}
                    </h3>
                    {nameEn && (
                        <span className="text-sm font-pixelify text-mid-gray mt-1">{nameEn}</span>
                    )}
                </div>

                {/* Type Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {type.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 text-[10px] font-bold font-shimshon bg-tetris-cyan/30 border border-off-black">
                            {t}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-dark-gray font-ibm line-clamp-3 mb-4 flex-1">
                    {description}
                </p>

                {/* Footer Actions */}
                <div className="mt-auto pt-3 border-t-2 border-off-black/10 flex justify-between items-center">
                    {link ? (
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5',
                                'bg-off-black text-off-white',
                                'text-xs font-bold font-shimshon',
                                'hover:bg-tetris-purple transition-colors'
                            )}
                        >
                            <span>לאתר</span>
                            <ExternalLink size={12} />
                        </a>
                    ) : (
                        <span className="text-xs text-mid-gray font-shimshon">אין קישור</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MuseumCard;
