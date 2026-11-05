import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import type { Grade } from './domain';

const paths = {
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  back: 'M20 12H5m6 6-6-6 6-6',
  down: 'm6 9 6 6 6-6',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M18 6 6 18',
  alert: 'M12 8v4m0 4h.01M10.3 4.9 3.4 17a1.5 1.5 0 0 0 1.3 2.2h14.6a1.5 1.5 0 0 0 1.3-2.2L13.7 4.9a2 2 0 0 0-3.4 0Z',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  pause: 'M9 5v14m6-14v14',
  play: 'm8 5 12 7-12 7Z',
  replay: 'M4 11a8 8 0 1 1 1.8 6M4 5v6h6',
  book: 'M12 6v14M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v14h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z',
  image: 'M3 4h18v16H3z M3 16l5-5 5 5 3-3 5 5 M16 8h.01',
};

export function Icon({name, size = 18}: {name: keyof typeof paths; size?: number}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]}/></svg>;
}

export function Belt({colors}: {colors: Grade['colors']}) {
  return <span className="belt" aria-hidden="true">
    {colors.map(color => <span key={color} style={{backgroundColor: color}}/>)}
  </span>;
}

export function GradeMark({grade}: {grade: Grade}) {
  return <span className="grade-mark"><Belt colors={grade.colors}/>{grade.name}</span>;
}

export function ActionLink({children, className = '', ...props}: ComponentProps<typeof Link>) {
  return <Link className={`button ${className}`} {...props}>{children}<Icon name="arrow" size={17}/></Link>;
}

export function TextLink({children, back = false, ...props}: ComponentProps<typeof Link> & {back?: boolean}) {
  return <Link className="text-link" {...props}>
    {back && <Icon name="back" size={16}/>}<span>{children}</span>{!back && <Icon name="arrow" size={16}/>}
  </Link>;
}

export function studyAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
