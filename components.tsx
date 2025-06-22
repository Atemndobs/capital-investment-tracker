
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Contribution, Contributor, ModalView, ContributorSummary, SupabaseStatus, GeminiStatus } from './types';
import { generateCommentSuggestion, isGeminiAiAvailable, getGeminiApiKeyStatus } from './services';
import { isSupabaseAvailable as checkSupabaseAvailable, getSupabaseStatus as getSupabaseConnectionStatus } from './supabaseService'; // For status display
import { 
  CHART_COLORS, 
  LIGHT_THEME_CARD_COLOR_PALE,
  LIGHT_THEME_CARD_COLOR_MEDIUM,
  LIGHT_THEME_CARD_COLOR_FULL,
  DARK_THEME_CARD_COLOR_PALE,
  DARK_THEME_CARD_COLOR_MEDIUM,
  DARK_THEME_CARD_COLOR_FULL,
  SUPABASE_SETUP_REQUIRED_BANNER_MESSAGE
} from './constants';

// Icon Props Interface
interface IconProps extends React.SVGProps<SVGSVGElement> { // Extend standard SVG props
  title?: string; 
}

// Icon Components
const PlusIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EditIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const DeleteIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.24.032 3.287.094M5.106 5.79c-.342-.053-.682-.107-1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const UserCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const ChartPieIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
  </svg>
);

const SunIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const MoonIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const CogIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11-.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.148c.424-.071.765-.383.93-.781.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.149-.893Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const AlertTriangleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style, title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} {...props} aria-hidden={!title} role={title ? "img" : undefined}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);


const getInitials = (name: string): string => {
  if (!name) return '';
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;
  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
  return rgbToHex(r, g, b);
};

const LIGHT_MODE_DARK_BG_THRESHOLD_PROGRESS = 75; 
interface CardDynamicStyles {
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  positiveStatusColor: string;
  negativeStatusColor: string;
  footerTextColor: string;
  innerBorderColor: string;
}

const getCardStyles = (progressPercent: number, baseChartColor: string, isDarkMode: boolean): CardDynamicStyles => {
  let backgroundColor: string;
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const paleColor = isDarkMode ? DARK_THEME_CARD_COLOR_PALE : LIGHT_THEME_CARD_COLOR_PALE;
  const mediumColor = isDarkMode ? DARK_THEME_CARD_COLOR_MEDIUM : LIGHT_THEME_CARD_COLOR_MEDIUM;
  const fullColor = isDarkMode ? DARK_THEME_CARD_COLOR_FULL : LIGHT_THEME_CARD_COLOR_FULL;

  if (clampedProgress < 50) backgroundColor = interpolateColor(paleColor, mediumColor, clampedProgress / 50);
  else backgroundColor = interpolateColor(mediumColor, fullColor, (clampedProgress - 50) / 50);
  
  const useLightText = isDarkMode || (!isDarkMode && clampedProgress >= LIGHT_MODE_DARK_BG_THRESHOLD_PROGRESS);

  return {
    backgroundColor,
    textColor: useLightText ? 'text-white' : 'text-slate-800 dark:text-dark-text-primary',
    secondaryTextColor: useLightText ? 'text-purple-200 dark:text-gray-300' : 'text-slate-600 dark:text-dark-text-secondary',
    positiveStatusColor: useLightText ? 'text-green-300 dark:text-green-400' : 'text-green-600 dark:text-green-500',
    negativeStatusColor: useLightText ? 'text-red-300 dark:text-red-400' : 'text-red-600 dark:text-red-500',
    footerTextColor: useLightText ? 'text-purple-300 dark:text-gray-400' : 'text-slate-500 dark:text-dark-text-secondary',
    innerBorderColor: useLightText ? 'border-slate-200/20 dark:border-gray-700' : 'border-slate-200/50 dark:border-gray-600',
  };
};

const inputBaseClasses = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-nebula-purple focus:border-nebula-purple dark:focus:ring-brand-purple dark:focus:border-brand-purple";
const inputNormalClasses = "border-slate-300 dark:bg-dark-input dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-secondary";
const inputErrorClasses = "border-red-500 dark:border-red-400";
const primaryButtonClasses = "px-4 py-2 text-sm font-medium text-white bg-nebula-purple hover:bg-indigo-700 dark:bg-brand-purple dark:hover:bg-opacity-80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nebula-purple dark:focus:ring-brand-purple dark:focus:ring-offset-dark-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryButtonClasses = "px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-dark-text-primary dark:bg-dark-card-hover dark:hover:bg-opacity-80 dark:border-dark-border rounded-lg border border-slate-300 transition-colors";
const tertiaryButtonClasses = "px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-dark-border rounded-md";
const destructiveButtonClasses = "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 dark:focus:ring-offset-dark-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const labelBaseClasses = "block text-sm font-medium text-slate-700 dark:text-dark-text-secondary";

export const Navbar: React.FC<{ 
  onAddContribution: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}> = ({ onAddContribution, onOpenSettings, isDarkMode, toggleDarkMode }) => (
    <nav className="bg-nebula-purple dark:bg-dark-card shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <span className="font-bold text-2xl text-white dark:text-dark-text-primary">NebulaLogix Capital Tracker</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
             <button onClick={onOpenSettings} className="p-2 rounded-full text-white dark:text-dark-text-primary hover:bg-white/20 dark:hover:bg-white/10 transition-colors" aria-label="Open settings" title="Open settings">
              <CogIcon className="w-6 h-6" title="Settings"/>
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-full text-white dark:text-dark-text-primary hover:bg-white/20 dark:hover:bg-white/10 transition-colors" aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"} title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
              {isDarkMode ? <SunIcon className="w-6 h-6" title="Light mode" /> : <MoonIcon className="w-6 h-6" title="Dark mode"/>}
            </button>
            <button onClick={onAddContribution} className="bg-white text-nebula-purple hover:bg-nebula-light-purple dark:bg-brand-purple dark:text-white dark:hover:bg-opacity-80 font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center space-x-1 sm:space-x-2">
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" title="Add Contribution Icon"/>
              <span className="text-sm sm:text-base">Add Contribution</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
);

interface SetupBannerProps {
  onOpenSettings: () => void;
}
export const SetupBanner: React.FC<SetupBannerProps> = ({ onOpenSettings }) => (
  <div className="bg-status-amber text-white p-4 text-center sticky top-20 z-40 flex items-center justify-center space-x-3 shadow-lg">
    <AlertTriangleIcon className="w-6 h-6 flex-shrink-0" title="Warning" />
    <p className="text-sm font-medium">
      {SUPABASE_SETUP_REQUIRED_BANNER_MESSAGE}
    </p>
    <button
      onClick={onOpenSettings}
      className="ml-4 px-3 py-1.5 text-xs font-semibold bg-white text-status-amber rounded-md hover:bg-amber-50 transition-colors"
    >
      Go to Settings
    </button>
  </div>
);


interface SummaryCardProps {
  contributor: ContributorSummary;
  color: string;
  isDarkMode: boolean;
}
export const SummaryCard: React.FC<SummaryCardProps> = ({ contributor, color, isDarkMode }) => {
  const styles = getCardStyles(contributor.stats.progressTo50PercentTarget, color, isDarkMode);
  const cardStyle = { borderTopColor: color, borderTopWidth: '4px', backgroundColor: styles.backgroundColor };
  
  return (
    <div className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl h-full flex flex-col justify-between animate-fade-in-up dark:shadow-purple-500/10`} style={cardStyle}>
      <div>
        <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} ring-2 ${isDarkMode ? 'ring-slate-600' : 'ring-slate-300'}`}>
                {contributor.profilePictureUrl ? (
                  <img src={contributor.profilePictureUrl} alt={contributor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-xl font-semibold ${styles.textColor}`}>{getInitials(contributor.name)}</span>
                )}
            </div>
            <h3 className={`text-xl font-semibold ${styles.textColor}`}>{contributor.name}</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className={`${styles.secondaryTextColor}`}>Total Invested:</span>
            <span className={`font-bold text-lg ${styles.textColor}`}>${contributor.stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`${styles.secondaryTextColor}`}>Share of Total:</span>
            <span className={`font-semibold ${styles.textColor}`}>{contributor.stats.percentageShare.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`${styles.secondaryTextColor}`}>vs. 50% Target:</span>
            <span className={`font-semibold ${contributor.stats.diffToTarget5050 >= 0 ? styles.positiveStatusColor : styles.negativeStatusColor}`}>
              {contributor.stats.diffToTarget5050 >= 0 ? '+' : ''}${contributor.stats.diffToTarget5050.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
       <div className={`mt-4 pt-4 border-t ${styles.innerBorderColor}`}>
        <p className={`text-xs ${styles.footerTextColor}`}>Represents {contributor.stats.percentageShare.toFixed(1)}% of total capital. {contributor.email && `Contact: ${contributor.email}`}</p>
      </div>
    </div>
  );
};

interface ContributionDonutChartProps {
  summaries: ContributorSummary[];
  colors: string[];
  allContributions: Contribution[];
  isDarkMode: boolean;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (isNaN(percent) || percent < 0.03) return null;
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
};

interface CustomTooltipContentProps {
  active?: boolean;
  payload?: any[];
  allContributions: Contribution[];
  isDarkMode: boolean;
}

const CustomTooltipContent: React.FC<CustomTooltipContentProps> = ({ active, payload, allContributions, isDarkMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // This is the chartData item { name, value, percentage, contributorId }
    const contributorId = data.contributorId;
    const contributorName = data.name;
    const totalAmount = data.value;
    const percentageShare = data.percentage;

    const contributorContributions = allContributions
      .filter(c => c.contributor_id === contributorId && (!c.isOptimistic || c.hasError === false))
      .sort((a, b) => new Date(b.contributed_at).getTime() - new Date(a.contributed_at).getTime());

    const tooltipBg = isDarkMode ? 'bg-dark-card-hover' : 'bg-white';
    const tooltipText = isDarkMode ? 'text-dark-text-primary' : 'text-slate-700';
    const tooltipBorder = isDarkMode ? 'border-dark-border' : 'border-slate-200';
    const itemText = isDarkMode ? 'text-dark-text-secondary' : 'text-slate-600';
    const itemBorder = isDarkMode ? 'border-dark-border' : 'border-slate-200';


    return (
      <div className={`${tooltipBg} p-3 rounded-lg shadow-xl border ${tooltipBorder} max-w-sm text-sm ${tooltipText} transition-colors duration-300`}>
        <p className="font-bold mb-1 text-base">{contributorName}</p>
        <p className="mb-2">
          Total: <span className="font-semibold">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> ({percentageShare.toFixed(2)}%)
        </p>
        {contributorContributions.length > 0 && (
          <>
            <p className={`font-medium mt-2 mb-1 border-t ${itemBorder} pt-1`}>Individual Contributions:</p>
            <ul className="list-none space-y-1 max-h-40 overflow-y-auto pr-1">
              {contributorContributions.map(c => (
                <li key={c.id || c.tempId} className={`text-xs ${itemText}`}>
                  <span className="font-mono">{new Date(c.contributed_at).toLocaleDateString()}</span>: 
                  <span className="font-semibold ml-1">${c.amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {c.comment && (
                    <span className="italic ml-1 block sm:inline-block max-w-[150px] sm:max-w-none truncate" title={c.comment}>
                       - {c.comment}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }
  return null;
};

export const ContributionDonutChart: React.FC<ContributionDonutChartProps> = ({ summaries, colors, allContributions, isDarkMode }) => {
  const chartData = summaries.filter(s => s.stats.total > 0).map(summary => ({
    name: summary.name, 
    value: summary.stats.total, 
    percentage: summary.stats.percentageShare, 
    contributorId: summary.id, // Pass contributorId for the custom tooltip
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg text-center text-slate-500 dark:text-dark-text-secondary h-96 flex items-center justify-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        No contribution data available to display chart.
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-xl shadow-lg animate-fade-in-up dark:shadow-purple-500/10" style={{animationDelay: '0.2s'}}>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-dark-text-primary mb-6 flex items-center">
        <ChartPieIcon className="w-6 h-6 text-nebula-purple dark:text-brand-purple mr-2" title="Chart Icon"/> Current Contribution Breakdown
      </h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie 
              data={chartData} 
              cx="50%" 
              cy="50%" 
              labelLine={false} 
              label={renderCustomizedLabel} 
              innerRadius="55%" 
              outerRadius="85%" 
              fill="#8884d8" 
              dataKey="value" 
              nameKey="name" 
              paddingAngle={2}
            >
              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={isDarkMode ? '#1F2021' : '#FFFFFF'} strokeWidth={2}/>)}
            </Pie>
            <Tooltip
              content={<CustomTooltipContent allContributions={allContributions} isDarkMode={isDarkMode} />}
              cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
            />
            <Legend wrapperStyle={{paddingTop: '20px'}}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ContributionTableProps {
  contributions: Contribution[];
  contributors: Contributor[];
  onEdit: (contribution: Contribution) => void;
  onDeleteRequest: (contributionId: string) => void; // Changed from onDelete
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterContributorId: string;
  setFilterContributorId: (id: string) => void;
  isLoading?: boolean;
}

const ContributionListItem: React.FC<{
  contribution: Contribution;
  contributorName: string;
  onEdit: (contribution: Contribution) => void;
  onDeleteRequest: (contributionId: string) => void; // Changed from onDelete
}> = ({ contribution, contributorName, onEdit, onDeleteRequest }) => {
  let rowClass = "border-b border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-card-hover transition-colors duration-150";
  if (contribution.isOptimistic) rowClass += " opacity-70";
  if (contribution.hasError) rowClass += " border-l-4 border-red-500"; 
  
  return (
    <tr className={rowClass} title={contribution.isOptimistic ? "Processing..." : contribution.hasError ? "Error with this item" : undefined}>
      <td className="py-3 px-4 text-sm text-slate-700 dark:text-dark-text-secondary">{new Date(contribution.contributed_at).toLocaleDateString()}</td>
      <td className="py-3 px-4 text-sm text-slate-700 dark:text-dark-text-secondary">{contributorName}</td>
      <td className="py-3 px-4 text-sm text-slate-700 dark:text-dark-text-secondary text-right">${contribution.amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td className="py-3 px-4 text-sm text-slate-600 dark:text-dark-text-secondary max-w-xs truncate" title={contribution.comment || undefined}>{contribution.comment || '-'}</td>
      <td className="py-3 px-4 text-sm text-slate-700 dark:text-dark-text-secondary">
        <div className="flex items-center justify-end space-x-2">
          {contribution.hasError && <AlertTriangleIcon className="w-4 h-4 text-red-500" title="Error processing this item"/> }
          <button onClick={() => onEdit(contribution)} className="text-nebula-blue hover:text-blue-700 dark:text-nebula-light-blue dark:hover:text-blue-400 p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="Edit contribution" disabled={contribution.isOptimistic}><EditIcon className="w-4 h-4" title="Edit Icon" /></button>
          <button onClick={() => onDeleteRequest(contribution.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Delete contribution" disabled={contribution.isOptimistic}><DeleteIcon className="w-4 h-4" title="Delete Icon" /></button>
        </div>
      </td>
    </tr>
  );
};


export const ContributionTable: React.FC<ContributionTableProps> = ({
  contributions, contributors, onEdit, onDeleteRequest, searchTerm, setSearchTerm, filterContributorId, setFilterContributorId, isLoading
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Contribution | 'contributorName'; direction: 'ascending' | 'descending' } | null>({ key: 'created_at', direction: 'descending' });

  const getContributorName = (id: string) => contributors.find(c => c.id === id)?.name || 'Unknown';

  const sortedContributions = useMemo(() => {
    let sortableItems = [...contributions].map(c => ({...c, contributorName: getContributorName(c.contributor_id)}));
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'created_at' || sortConfig.key === 'contributed_at') { 
            valA = new Date(a[sortConfig.key] || 0).getTime();
            valB = new Date(b[sortConfig.key] || 0).getTime();
        } else {
            // @ts-ignore
             valA = a[sortConfig.key]; valB = b[sortConfig.key];
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [contributions, sortConfig, contributors]);

  const requestSort = (key: keyof Contribution | 'contributorName') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };
  
  const SortIndicator: React.FC<{direction?: 'ascending' | 'descending'}> = ({direction}) => {
    if (!direction) return null;
    return direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };

  const filteredContributions = sortedContributions.filter(c => {
    const contributor = contributors.find(contrib => contrib.id === c.contributor_id);
    const matchesSearchTerm = searchTerm === '' ||
      c.amount_usd.toString().includes(searchTerm) ||
      (c.comment && c.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contributor && contributor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      new Date(c.contributed_at).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterContributorId === '' || c.contributor_id === filterContributorId;
    return matchesSearchTerm && matchesFilter;
  });

  return (
    <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-xl shadow-lg animate-fade-in-up dark:shadow-purple-500/10" style={{animationDelay: '0.3s'}}>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-dark-text-primary mb-4">All Contributions</h3>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
        <input type="text" placeholder="Search contributions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full sm:w-1/2 lg:w-1/3 ${inputBaseClasses} ${inputNormalClasses}`} />
        <select value={filterContributorId} onChange={(e) => setFilterContributorId(e.target.value)} className={`w-full sm:w-auto bg-white ${inputBaseClasses} ${inputNormalClasses}`}>
          <option value="">All Contributors</option>
          {contributors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {isLoading && <LoadingSpinner />}
      {!isLoading && filteredContributions.length === 0 && <p className="text-slate-500 dark:text-dark-text-secondary text-center py-8">No contributions found matching your criteria. Add some or check Supabase connection in Settings.</p>}
      {!isLoading && filteredContributions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-100 dark:bg-dark-card-hover text-left text-xs font-semibold text-slate-600 dark:text-dark-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => requestSort('contributed_at')}>Date <SortIndicator direction={sortConfig?.key === 'contributed_at' ? sortConfig.direction : undefined} /></th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => requestSort('contributorName')}>Contributor <SortIndicator direction={sortConfig?.key === 'contributorName' ? sortConfig.direction : undefined} /></th>
                <th className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => requestSort('amount_usd')}>Amount (USD) <SortIndicator direction={sortConfig?.key === 'amount_usd' ? sortConfig.direction : undefined} /></th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => requestSort('comment')}>Comment <SortIndicator direction={sortConfig?.key === 'comment' ? sortConfig.direction : undefined} /></th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>{filteredContributions.map(c => <ContributionListItem key={c.id || c.tempId} contribution={c} contributorName={getContributorName(c.contributor_id)} onEdit={onEdit} onDeleteRequest={onDeleteRequest} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface ContributionFormProps {
  onClose: () => void;
  onSave: (contribution: Omit<Contribution, 'id' | 'created_at' | 'updated_at'>, originalId?: string) => Promise<void>; // For edit
  contributors: Contributor[];
  initialData?: Contribution | null;
  isSaving: boolean;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({ onClose, onSave, contributors, initialData, isSaving }) => {
  const [formData, setFormData] = useState<Partial<Omit<Contribution, 'id' | 'created_at' | 'updated_at'>>>(
    initialData 
      ? { contributor_id: initialData.contributor_id, contributed_at: initialData.contributed_at, amount_usd: initialData.amount_usd, comment: initialData.comment }
      : { contributor_id: contributors[0]?.id || '', contributed_at: new Date().toISOString().split('T')[0], amount_usd: 0, comment: '' }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuggestingComment, setIsSuggestingComment] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus>(getGeminiApiKeyStatus());

  useEffect(() => {
    if (initialData) {
      setFormData({ contributor_id: initialData.contributor_id, contributed_at: initialData.contributed_at, amount_usd: initialData.amount_usd, comment: initialData.comment });
    } else {
      setFormData(prev => ({ ...prev, contributor_id: contributors[0]?.id || '', contributed_at: new Date().toISOString().split('T')[0], amount_usd: 0, comment: '' }));
    }
  }, [initialData, contributors]);

  useEffect(() => {
    const statusInterval = setInterval(() => setGeminiStatus(getGeminiApiKeyStatus()), 5000); // Check status periodically
    return () => clearInterval(statusInterval);
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.contributor_id) newErrors.contributor_id = "Contributor is required.";
    if (!formData.contributed_at) newErrors.contributed_at = "Date is required.";
    if (!formData.amount_usd || formData.amount_usd <= 0) newErrors.amount_usd = "Amount must be greater than 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount_usd' ? parseFloat(value) : value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // @ts-ignore // FormData is Partial, but we've validated
      await onSave(formData, initialData?.id);
    }
  };

  const handleSuggestComment = async () => {
    if (!formData.amount_usd || !formData.contributor_id) {
      setErrors(prev => ({ ...prev, comment: "Amount and contributor are needed for suggestion." })); return;
    }
    const contributor = contributors.find(c => c.id === formData.contributor_id);
    if (!contributor) return;

    setIsSuggestingComment(true); setErrors(prev => ({ ...prev, comment: "" }));
    try {
      const suggestion = await generateCommentSuggestion(formData.amount_usd, contributor.name);
      setFormData(prev => ({ ...prev, comment: suggestion }));
      if (suggestion.startsWith("AI suggestions unavailable") || suggestion.startsWith("Could not generate suggestion")) {
         setErrors(prev => ({ ...prev, comment: suggestion }));
      }
    } catch (error) {
      console.error("Failed to suggest comment:", error);
      setErrors(prev => ({ ...prev, comment: "Failed to load suggestion." }));
    } finally { setIsSuggestingComment(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div>
        <label htmlFor="contributor_id" className={labelBaseClasses}>Contributor</label>
        <select id="contributor_id" name="contributor_id" value={formData.contributor_id || ''} onChange={handleChange} className={`${inputBaseClasses} ${errors.contributor_id ? inputErrorClasses : inputNormalClasses}`} >
          <option value="" disabled>Select Contributor</option>
          {contributors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.contributor_id && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.contributor_id}</p>}
      </div>
      <div>
        <label htmlFor="contributed_at" className={labelBaseClasses}>Date</label>
        <input type="date" id="contributed_at" name="contributed_at" value={formData.contributed_at} onChange={handleChange} className={`${inputBaseClasses} ${errors.contributed_at ? inputErrorClasses : inputNormalClasses}`} />
        {errors.contributed_at && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.contributed_at}</p>}
      </div>
      <div>
        <label htmlFor="amount_usd" className={labelBaseClasses}>Amount (USD)</label>
        <input type="number" id="amount_usd" name="amount_usd" value={formData.amount_usd || ''} onChange={handleChange} step="0.01" className={`${inputBaseClasses} ${errors.amount_usd ? inputErrorClasses : inputNormalClasses}`} />
        {errors.amount_usd && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.amount_usd}</p>}
      </div>
      <div>
        <label htmlFor="comment" className={labelBaseClasses}>Comment</label>
        <textarea id="comment" name="comment" value={formData.comment || ''} onChange={handleChange} rows={3} className={`${inputBaseClasses} ${inputNormalClasses}`} />
        {errors.comment && !errors.comment.startsWith("AI suggestions unavailable") && !errors.comment.startsWith("Could not generate suggestion") && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.comment}</p>}
         <button type="button" onClick={handleSuggestComment} disabled={isSuggestingComment || !isGeminiAiAvailable()} className="mt-2 text-sm text-nebula-purple hover:text-indigo-700 dark:text-brand-purple dark:hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSuggestingComment ? 'Suggesting...' : 'Suggest Comment (AI)'}
        </button>
        {!isGeminiAiAvailable() && <p className={`mt-1 text-xs ${geminiStatus.type === 'error' ? 'text-status-red' : 'text-status-amber'}`}>{geminiStatus.message}</p>}
         {errors.comment && (errors.comment.startsWith("AI suggestions unavailable") || errors.comment.startsWith("Could not generate suggestion")) && <p className="mt-1 text-xs text-status-amber">{errors.comment}</p>}
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className={secondaryButtonClasses} disabled={isSaving}>Cancel</button>
        <button type="submit" className={primaryButtonClasses} disabled={isSaving}>{isSaving ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Contribution')}</button>
      </div>
    </form>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;
  const sizeClasses = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className={`bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-fade-in-up`}>
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-dark-border">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-dark-text-primary">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-dark-text-secondary dark:hover:text-dark-text-primary transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void; // Typically handles cancel
  onConfirm: () => void; // Handles the destructive action
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-[110]" role="alertdialog" aria-modal="true" aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
        <div className="p-6">
          <h3 id="alert-dialog-title" className="text-lg font-semibold text-slate-800 dark:text-dark-text-primary mb-2">{title}</h3>
          <p id="alert-dialog-description" className="text-sm text-slate-600 dark:text-dark-text-secondary mb-6">{description}</p>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-dark-card-hover/50 border-t border-slate-200 dark:border-dark-border flex justify-end space-x-3 rounded-b-xl">
          <button onClick={onClose} className={secondaryButtonClasses}>
            {cancelButtonText}
          </button>
          <button onClick={onConfirm} className={destructiveButtonClasses}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributors: Contributor[];
  onAddContributor: (contributorData: Pick<Contributor, 'name' | 'email' | 'profilePictureUrl'>) => Promise<void>;
  onUpdateContributor: (id: string, updates: Partial<Pick<Contributor, 'name' | 'email' | 'profilePictureUrl'>>) => Promise<void>;
  isContributorSaving: boolean;
  geminiApiKey: string | null;
  onSaveGeminiApiKey: (key: string) => void;
  currentGeminiApiKeyStatus: GeminiStatus;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  onSaveSupabaseCredentials: (url: string, anonKey: string) => void;
  currentSupabaseStatus: SupabaseStatus;
  isDarkMode: boolean;
}

type SettingsTab = 'profiles' | 'apiKey' | 'supabase';

const StatusIndicator: React.FC<{ status: SupabaseStatus | GeminiStatus }> = ({ status }) => {
  const colorClass = status.type === 'success' ? 'text-status-green' : status.type === 'error' ? 'text-status-red' : 'text-status-amber';
  return <p className={`text-xs mt-2 ${colorClass}`}>{status.message}</p>;
};

interface NewContributorData {
  name: string;
  email: string;
  profilePictureUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose,
  contributors, onAddContributor, onUpdateContributor, isContributorSaving,
  geminiApiKey, onSaveGeminiApiKey, currentGeminiApiKeyStatus,
  supabaseUrl, supabaseAnonKey, onSaveSupabaseCredentials, currentSupabaseStatus,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profiles');
  const [newContributorData, setNewContributorData] = useState<NewContributorData>({ name: '', email: '', profilePictureUrl: '' });
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [editingContributorData, setEditingContributorData] = useState<Partial<NewContributorData>>({});
  
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState(geminiApiKey || '');
  const [geminiApiMessage, setGeminiApiMessage] = useState('');

  const [localSupabaseUrl, setLocalSupabaseUrl] = useState(supabaseUrl || '');
  const [localSupabaseAnonKey, setLocalSupabaseAnonKey] = useState(supabaseAnonKey || '');
  const [supabaseMessage, setSupabaseMessage] = useState('');

  useEffect(() => { setLocalGeminiApiKey(geminiApiKey || ''); }, [geminiApiKey]);
  useEffect(() => { setLocalSupabaseUrl(supabaseUrl || ''); }, [supabaseUrl]);
  useEffect(() => { setLocalSupabaseAnonKey(supabaseAnonKey || ''); }, [supabaseAnonKey]);


  const handleAddProfile = async () => {
    if (newContributorData.name.trim()) {
      await onAddContributor({
        name: newContributorData.name.trim(),
        email: newContributorData.email.trim() || null,
        profilePictureUrl: newContributorData.profilePictureUrl.trim() || null,
      });
      setNewContributorData({ name: '', email: '', profilePictureUrl: '' });
    }
  };

  const handleStartEdit = (contributor: Contributor) => {
    setEditingContributor(contributor);
    setEditingContributorData({
      name: contributor.name,
      email: contributor.email || '',
      profilePictureUrl: contributor.profilePictureUrl || '',
    });
  };

  const handleSaveEdit = async () => {
    if (editingContributor && editingContributorData.name && editingContributorData.name.trim()) {
      await onUpdateContributor(editingContributor.id, { 
        name: editingContributorData.name.trim(),
        email: editingContributorData.email?.trim() || null,
        profilePictureUrl: editingContributorData.profilePictureUrl?.trim() || null
      });
      setEditingContributor(null); 
      setEditingContributorData({});
    }
  };

  const handleNewContributorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContributorData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditingContributorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingContributorData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveGeminiKey = () => {
    onSaveGeminiApiKey(localGeminiApiKey);
    setGeminiApiMessage("Gemini API Key saved.");
    setTimeout(() => setGeminiApiMessage(''), 3000);
  };

  const handleSaveSupabaseCreds = () => {
    onSaveSupabaseCredentials(localSupabaseUrl, localSupabaseAnonKey);
    setSupabaseMessage("Supabase credentials saved. Service will attempt to re-initialize.");
    setTimeout(() => setSupabaseMessage(''), 3000);
  };
  
  const tabButtonClasses = (tabName: SettingsTab) => 
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName 
      ? 'bg-nebula-purple text-white dark:bg-brand-purple' 
      : 'text-slate-600 hover:bg-slate-100 dark:text-dark-text-secondary dark:hover:bg-dark-card-hover'}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Settings" size="2xl">
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-dark-border">
          <nav className="-mb-px flex space-x-2" aria-label="Tabs">
            <button onClick={() => setActiveTab('profiles')} className={tabButtonClasses('profiles')}>Profiles</button>
            <button onClick={() => setActiveTab('apiKey')} className={tabButtonClasses('apiKey')}>Gemini API Key</button>
            <button onClick={() => setActiveTab('supabase')} className={tabButtonClasses('supabase')}>Supabase</button>
          </nav>
        </div>

        {activeTab === 'profiles' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-700 dark:text-dark-text-primary">Manage Contributors</h4>
            <div className="p-4 border border-slate-200 dark:border-dark-border rounded-lg space-y-3">
                <h5 className="text-md font-medium text-slate-700 dark:text-dark-text-primary">Add New Contributor</h5>
                <div>
                    <label htmlFor="newContributorNameInput" className={labelBaseClasses}>Name (Required)</label>
                    <input type="text" id="newContributorNameInput" name="name" value={newContributorData.name} onChange={handleNewContributorChange} placeholder="Full name" className={`${inputBaseClasses} ${inputNormalClasses}`} />
                </div>
                <div>
                    <label htmlFor="newContributorEmailInput" className={labelBaseClasses}>Email (Optional)</label>
                    <input type="email" id="newContributorEmailInput" name="email" value={newContributorData.email} onChange={handleNewContributorChange} placeholder="Email address" className={`${inputBaseClasses} ${inputNormalClasses}`} />
                </div>
                <div>
                    <label htmlFor="newContributorProfilePictureUrlInput" className={labelBaseClasses}>Profile Picture URL (Optional)</label>
                    <input type="url" id="newContributorProfilePictureUrlInput" name="profilePictureUrl" value={newContributorData.profilePictureUrl} onChange={handleNewContributorChange} placeholder="https://example.com/image.png" className={`${inputBaseClasses} ${inputNormalClasses}`} />
                </div>
                <button onClick={handleAddProfile} className={`${primaryButtonClasses} w-full sm:w-auto`} disabled={isContributorSaving || !newContributorData.name.trim()}>
                    {isContributorSaving ? 'Adding...' : 'Add Profile'}
                </button>
            </div>
            
            <h5 className="text-md font-medium text-slate-700 dark:text-dark-text-primary pt-2">Existing Contributors</h5>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {contributors.map(c => (
                <li key={c.id} className={`p-3 rounded-md flex flex-col ${editingContributor?.id === c.id ? 'bg-slate-100 dark:bg-dark-card-hover' : 'bg-slate-50 dark:bg-dark-input'}`}>
                  {editingContributor?.id === c.id ? (
                      <div className="space-y-2">
                        <div>
                            <label htmlFor={`editingName-${c.id}`} className={labelBaseClasses}>Name</label>
                            <input type="text" id={`editingName-${c.id}`} name="name" value={editingContributorData.name || ''} onChange={handleEditingContributorChange} className={`${inputBaseClasses} ${inputNormalClasses} h-10 w-full`} autoFocus />
                        </div>
                        <div>
                            <label htmlFor={`editingEmail-${c.id}`} className={labelBaseClasses}>Email</label>
                            <input type="email" id={`editingEmail-${c.id}`} name="email" value={editingContributorData.email || ''} onChange={handleEditingContributorChange} className={`${inputBaseClasses} ${inputNormalClasses} h-10 w-full`} />
                        </div>
                        <div>
                            <label htmlFor={`editingProfilePictureUrl-${c.id}`} className={labelBaseClasses}>Profile Picture URL</label>
                            <input type="url" id={`editingProfilePictureUrl-${c.id}`} name="profilePictureUrl" value={editingContributorData.profilePictureUrl || ''} onChange={handleEditingContributorChange} className={`${inputBaseClasses} ${inputNormalClasses} h-10 w-full`} />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm py-1 px-2 rounded-md bg-green-100 dark:bg-green-800/30" disabled={isContributorSaving}>{isContributorSaving ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => setEditingContributor(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-sm py-1 px-2 rounded-md bg-slate-200 dark:bg-slate-600/30" disabled={isContributorSaving}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3 flex-grow min-w-0">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            {c.profilePictureUrl ? (
                              <img src={c.profilePictureUrl} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserCircleIcon className={`w-7 h-7 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} title={`${c.name} avatar`}/>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-slate-800 dark:text-dark-text-primary font-medium truncate" title={c.name}>{c.name}</p>
                            <p className="text-xs text-slate-500 dark:text-dark-text-secondary truncate" title={c.email || undefined}>{c.email || 'No email'}</p>
                          </div>
                        </div>
                        <button onClick={() => handleStartEdit(c)} className={`${tertiaryButtonClasses} self-start sm:self-center`} title={`Edit details for ${c.name}`} disabled={isContributorSaving}><EditIcon className="w-3.5 h-3.5 mr-1 inline-block" title="Edit Icon" /> Edit</button>
                      </div>
                    )}
                </li>
              ))}
            </ul>
             {contributors.length === 0 && <p className="text-sm text-slate-500 dark:text-dark-text-secondary">No contributors added yet.</p>}
          </div>
        )}

        {activeTab === 'apiKey' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-700 dark:text-dark-text-primary">Gemini API Key</h4>
            <p className="text-sm text-slate-600 dark:text-dark-text-secondary">Enter your Google Gemini API Key for AI-powered comment suggestions.</p>
            <div>
              <label htmlFor="geminiApiKeyInput" className={labelBaseClasses}>API Key</label>
              <input type="password" id="geminiApiKeyInput" value={localGeminiApiKey} onChange={(e) => setLocalGeminiApiKey(e.target.value)} placeholder="Enter your Gemini API Key" className={`${inputBaseClasses} ${inputNormalClasses}`} />
            </div>
            <button onClick={handleSaveGeminiKey} className={primaryButtonClasses}>Save Gemini API Key</button>
            {geminiApiMessage && <p className="text-sm text-status-green mt-2">{geminiApiMessage}</p>}
            <StatusIndicator status={currentGeminiApiKeyStatus} />
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">Your API key is stored locally in your browser.</p>
          </div>
        )}

        {activeTab === 'supabase' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-700 dark:text-dark-text-primary">Supabase Configuration</h4>
             <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
                Enter your Supabase Project URL and Anon Key. These are typically found in your Supabase project's API settings.
                <br/>
                For runtime discovery in a deployed environment, ensure <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> are set as global <code>window</code> variables or, in a Next.js app, as <code>NEXT_PUBLIC_</code> environment variables.
            </p>
            <div>
              <label htmlFor="supabaseUrlInput" className={labelBaseClasses}>Supabase URL</label>
              <input type="text" id="supabaseUrlInput" value={localSupabaseUrl} onChange={(e) => setLocalSupabaseUrl(e.target.value)} placeholder="https://your-project-ref.supabase.co" className={`${inputBaseClasses} ${inputNormalClasses}`} />
            </div>
            <div>
              <label htmlFor="supabaseAnonKeyInput" className={labelBaseClasses}>Supabase Anon Key</label>
              <input type="password" id="supabaseAnonKeyInput" value={localSupabaseAnonKey} onChange={(e) => setLocalSupabaseAnonKey(e.target.value)} placeholder="Enter your Supabase Anon Key" className={`${inputBaseClasses} ${inputNormalClasses}`} />
            </div>
            <button onClick={handleSaveSupabaseCreds} className={primaryButtonClasses}>Save Supabase Credentials</button>
            {supabaseMessage && <p className="text-sm text-status-green mt-2">{supabaseMessage}</p>}
            <StatusIndicator status={currentSupabaseStatus} />
             <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">Credentials are stored locally in your browser for this session if not provided by runtime environment variables.</p>
          </div>
        )}

         <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-dark-border">
            <button onClick={onClose} className={secondaryButtonClasses}>Close</button>
        </div>
      </div>
    </Modal>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'}> = ({size = 'md'}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };
    return (
      <div className="flex justify-center items-center py-4">
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-nebula-purple dark:border-brand-purple ${sizeClasses[size]}`}></div>
      </div>
    );
};
