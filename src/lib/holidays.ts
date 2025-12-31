// lib/holidays.ts
import { lunar } from "@shuimo-design/lunar";

export type HolidayDef = {
    name: string;
    greeting: string;
    priority: number;
    /** Hitting today? */
    isToday: (date: Date) => boolean;
};

/** —— All based on server's date —— */
function ymd(d: Date) {
    return { y: d.getFullYear(), m: d.getMonth() + 1, day: d.getDate() };
}
function isFixedDate(d: Date, month: number, day: number) {
    const x = ymd(d);
    return x.m === month && x.day === day;
}

/** nth weekday of month: weekday 0=Sun..6=Sat, n=1..5 */
function isNthWeekdayOfMonth(d: Date, month: number, weekday: number, n: number) {
    const x = ymd(d);
    if (x.m !== month || d.getDay() !== weekday) return false;
    const first = new Date(x.y, month - 1, 1);
    const firstWeekdayOffset = (weekday - first.getDay() + 7) % 7;
    const nthDate = 1 + firstWeekdayOffset + (n - 1) * 7;
    return x.day === nthDate;
}

/** last weekday of month */
// function isLastWeekdayOfMonth(d: Date, month: number, weekday: number) {
//     const x = ymd(d);
//     if (x.m !== month || d.getDay() !== weekday) return false;
//     const last = new Date(x.y, month, 0); // last day of month
//     const offset = (last.getDay() - weekday + 7) % 7;
//     const lastWeekdayDate = last.getDate() - offset;
//     return x.day === lastWeekdayDate;
// }

/**
 * Meeus/Jones/Butcher Gregorian Easter Sunday (valid for modern years)
 * Returns Date in server local timezone.
 */
function easterSunday(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Mar, 4=Apr
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function isEasterRelative(d: Date, offsetDays: number) {
    const year = d.getFullYear();
    const easter = easterSunday(year);
    const target = new Date(easter);
    target.setDate(easter.getDate() + offsetDays);

    return (
        d.getFullYear() === target.getFullYear() &&
        d.getMonth() === target.getMonth() &&
        d.getDate() === target.getDate()
    );
}

/** 中国农历：判断当天是否为农历 M/D（不区分闰月，够用且易维护） */
function isLunarMD(d: Date, lunarMonth: number, lunarDay: number) {
    const info = lunar(d);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = (info as any).month;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const day = (info as any).day;
    return m === lunarMonth && day === lunarDay;
}

/** The defalut 'G'day mate' will be the last priority rule */
export const HOLIDAYS: Record<string, HolidayDef> = {
    /** ====== Global / Common ====== */
    newYear: {
        name: "New Year's Day",
        greeting: "Happy New Year!",
        priority: 1000,
        isToday: (d) => isFixedDate(d, 1, 1),
    },
    christmas: {
        name: "Christmas Day",
        greeting: "Merry Christmas!",
        priority: 1000,
        isToday: (d) => isFixedDate(d, 12, 25),
    },
    boxingDay: {
        name: "Boxing Day",
        greeting: "Happy Boxing Day!",
        priority: 700,
        isToday: (d) => isFixedDate(d, 12, 26),
    },
    halloween: {
        name: "Halloween",
        greeting: "Happy Halloween!",
        priority: 450,
        isToday: (d) => isFixedDate(d, 10, 31),
    },
    valentines: {
        name: "Valentine's Day",
        greeting: "Happy Valentine's Day!",
        priority: 250,
        isToday: (d) => isFixedDate(d, 2, 14),
    },

    /** ====== Chinese traditional holidays (Lunar) ====== */
    lunarNewYear: {
        name: "Spring Festival (Chinese New Year)",
        greeting: "Happy Lunar New Year!",
        priority: 1000,
        isToday: (d) => isLunarMD(d, 1, 1),
    },
    lanternFestival: {
        name: "Lantern Festival",
        greeting: "Happy Lantern Festival!",
        priority: 600,
        isToday: (d) => isLunarMD(d, 1, 15),
    },
    dragonBoat: {
        name: "Dragon Boat Festival",
        greeting: "Happy Dragon Boat Festival!",
        priority: 600,
        isToday: (d) => isLunarMD(d, 5, 5),
    },
    midAutumn: {
        name: "Mid-Autumn Festival",
        greeting: "Happy Mid-Autumn Festival!",
        priority: 600,
        isToday: (d) => isLunarMD(d, 8, 15),
    },
    doubleNinth: {
        name: "Double Ninth Festival",
        greeting: "Happy Double Ninth Festival!",
        priority: 450,
        isToday: (d) => isLunarMD(d, 9, 9),
    },

    /** ====== US (major) ====== */
    mlkDay: {
        name: "Martin Luther King Jr. Day",
        greeting: "Happy MLK Day!",
        priority: 400,
        isToday: (d) => isNthWeekdayOfMonth(d, 1, 1, 3), // Jan, Mon, 3rd
    },
    thanksgiving: {
        name: "Thanksgiving Day (US)",
        greeting: "Happy Thanksgiving!",
        priority: 600,
        isToday: (d) => isNthWeekdayOfMonth(d, 11, 4, 4), // Nov, 4th Thu (Thu=4)
    },

    /** ====== UK/EU common-ish ====== */
    goodFriday: {
        name: "Good Friday",
        greeting: "Have a Blessed Good Friday!",
        priority: 420,
        isToday: (d) => isEasterRelative(d, -2),
    },
    easter: {
        name: "Easter Sunday",
        greeting: "Happy Easter!",
        priority: 420,
        isToday: (d) => isEasterRelative(d, 0),
    },
    easterMonday: {
        name: "Easter Monday",
        greeting: "Happy Easter Monday!",
        priority: 300,
        isToday: (d) => isEasterRelative(d, 1),
    },

    /** ====== Australia (national-ish) ====== */
    australiaDay: {
        name: "Australia Day",
        greeting: "Happy Australia Day!",
        priority: 420,
        isToday: (d) => isFixedDate(d, 1, 26),
    },
    anzacDay: {
        name: "ANZAC Day",
        greeting: "Lest We Forget.",
        priority: 420,
        isToday: (d) => isFixedDate(d, 4, 25),
    },

    /** ====== default ====== */
    default: {
        name: "Default",
        greeting: "G'day Mate!",
        priority: -999,
        isToday: () => true,
    },
};

export function pickGreeting(serverNow: Date = new Date()) {
    const defs = Object.values(HOLIDAYS);
    const hit = defs
        .filter((h) => h.isToday(serverNow))
        .sort((a, b) => b.priority - a.priority)[0];

    return {
        greeting: hit?.greeting ?? "G'day Mate!",
        holidayName: hit?.name ?? "Default",
    };
}
