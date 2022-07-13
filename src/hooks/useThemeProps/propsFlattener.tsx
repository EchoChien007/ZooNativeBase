import merge from 'lodash.merge';
import {
  findLastValidBreakpoint,
  hasValidBreakpointFormat,
} from '../../theme/tools';
import { getStyleAndFilteredProps } from '../../theme/styled-system';
// import {
//   findLastValidBreakpoint,
//   hasValidBreakpointFormat,
// } from './../../theme/tools';
const SPECIFICITY_1000 = 1000;
const SPECIFICITY_110 = 110;
const SPECIFICITY_100 = 100;
const SPECIFICITY_70 = 70;
const SPECIFICITY_60 = 60;
const SPECIFICITY_55 = 55;
const SPECIFICITY_50 = 50;
const SPECIFICITY_40 = 40;
const SPECIFICITY_30 = 30;
// SPECIFICITY_20 is being user for defferentiating between User Props and Theme Props. So any specificity less than SPECIFICITY_20 will be ovridable by user props.
const SPECIFICITY_20 = 20;
const SPECIFICITY_10 = 10;
const specificityPrecedence = [
  SPECIFICITY_1000,
  SPECIFICITY_110,
  SPECIFICITY_100,
  SPECIFICITY_70,
  SPECIFICITY_60,
  SPECIFICITY_55,
  SPECIFICITY_50,
  SPECIFICITY_40,
  SPECIFICITY_30,
  SPECIFICITY_20,
  SPECIFICITY_10,
];
const INITIAL_PROP_SPECIFICITY = {
  [SPECIFICITY_1000]: 0,
  [SPECIFICITY_110]: 0,
  [SPECIFICITY_100]: 0,
  [SPECIFICITY_70]: 0,
  [SPECIFICITY_60]: 0,
  [SPECIFICITY_50]: 0,
  [SPECIFICITY_55]: 0,
  [SPECIFICITY_40]: 0,
  [SPECIFICITY_30]: 0,
  [SPECIFICITY_20]: 0,
  [SPECIFICITY_10]: 0,
};

export const pseudoPropsMap = {
  _web: { dependentOn: 'platform', priority: SPECIFICITY_10 },
  _ios: { dependentOn: 'platform', priority: SPECIFICITY_10 },
  _android: { dependentOn: 'platform', priority: SPECIFICITY_10 },

  _light: { dependentOn: 'colormode', priority: SPECIFICITY_10 },
  _dark: { dependentOn: 'colormode', priority: SPECIFICITY_10 },

  // TODO: have to add more interactionProps and stateProps
  _indeterminate: {
    dependentOn: 'state',
    respondTo: 'isIndeterminate',
    priority: SPECIFICITY_30,
  },
  _checked: {
    dependentOn: 'state',
    respondTo: 'isChecked',
    priority: SPECIFICITY_30,
  },
  // Add new pseudeo props in between -------
  _readOnly: {
    dependentOn: 'state',
    respondTo: 'isReadOnly',
    priority: SPECIFICITY_30,
  },
  // Add new pseudeo props in between -------
  _invalid: {
    dependentOn: 'state',
    respondTo: 'isInvalid',
    priority: SPECIFICITY_40,
  },
  _focus: {
    dependentOn: 'state',
    respondTo: 'isFocused',
    priority: SPECIFICITY_50,
  },
  _focusVisible: {
    dependentOn: 'state',
    respondTo: 'isFocusVisible',
    priority: SPECIFICITY_55,
  },
  _hover: {
    dependentOn: 'state',
    respondTo: 'isHovered',
    priority: SPECIFICITY_60,
  },
  _pressed: {
    dependentOn: 'state',
    respondTo: 'isPressed',
    priority: SPECIFICITY_70,
  },
  _disabled: {
    dependentOn: 'state',
    respondTo: 'isDisabled',
    priority: SPECIFICITY_100,
  },
  _reversed: {
    dependentOn: 'state',
    respondTo: 'isReversed',
    priority: SPECIFICITY_100,
  },
  _loading: {
    dependentOn: 'state',
    respondTo: 'isLoading',
    priority: SPECIFICITY_110,
  },
  _important: {
    dependentOn: null,
    priority: SPECIFICITY_1000,
  },
} as const;

const SPREAD_PROP_SPECIFICITY_ORDER = [
  'p',
  'padding',
  'px',
  'py',
  'pt',
  'pb',
  'pl',
  'pr',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'm',
  'margin',
  'mx',
  'my',
  'mt',
  'mb',
  'ml',
  'mr',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
];

const FINAL_SPREAD_PROPS = [
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
];

const MARGIN_MAP: any = {
  mx: ['marginRight', 'marginLeft'],
  my: ['marginTop', 'marginBottom'],
  mt: ['marginTop'],
  mb: ['marginBottom'],
  mr: ['marginRight'],
  ml: ['marginLeft'],
};

MARGIN_MAP.margin = [...MARGIN_MAP.mx, ...MARGIN_MAP.my];
MARGIN_MAP.m = MARGIN_MAP.margin;
MARGIN_MAP.marginTop = MARGIN_MAP.mt;
MARGIN_MAP.marginBottom = MARGIN_MAP.mb;
MARGIN_MAP.marginLeft = MARGIN_MAP.ml;
MARGIN_MAP.marginRight = MARGIN_MAP.mr;

const PADDING_MAP: any = {
  px: ['paddingRight', 'paddingLeft'],
  py: ['paddingTop', 'paddingBottom'],
  pt: ['paddingTop'],
  pb: ['paddingBottom'],
  pr: ['paddingRight'],
  pl: ['paddingLeft'],
};

PADDING_MAP.padding = [...PADDING_MAP.px, ...PADDING_MAP.py];
PADDING_MAP.p = PADDING_MAP.padding;
PADDING_MAP.paddingTop = PADDING_MAP.pt;
PADDING_MAP.paddingBottom = PADDING_MAP.pb;
PADDING_MAP.paddingLeft = PADDING_MAP.pl;
PADDING_MAP.paddingRight = PADDING_MAP.pr;

const SPREAD_PROP_SPECIFICITY_MAP: any = {
  ...PADDING_MAP,
  ...MARGIN_MAP,
};

type IPseudoPropsMap = typeof pseudoPropsMap;
type ExtractState<T extends IPseudoPropsMap> = {
  // @ts-ignore
  [P in keyof T as T[P]['respondTo']]?: boolean;
};
export type IStateProps = ExtractState<IPseudoPropsMap>;

export function propsSpreader(incomingProps: any, incomingSpecifity: any) {
  const flattenedDefaultProps: any = { ...incomingProps };
  const specificity: any = {};

  SPREAD_PROP_SPECIFICITY_ORDER.forEach((prop) => {
    if (prop in flattenedDefaultProps) {
      const val = incomingProps[prop] || flattenedDefaultProps[prop];
      if (!FINAL_SPREAD_PROPS.includes(prop)) {
        delete flattenedDefaultProps[prop];
        specificity[prop] = incomingSpecifity[prop];
      }

      SPREAD_PROP_SPECIFICITY_MAP[prop].forEach((newProp: string) => {
        if (compareSpecificity(specificity[newProp], specificity[prop])) {
          specificity[newProp] = incomingSpecifity[prop];
          flattenedDefaultProps[newProp] = val;
        }
      });
    }
  });

  return merge({}, flattenedDefaultProps);
}
export const compareSpecificity = (
  exisiting: any,
  upcoming: any,
  ignorebaseTheme?: boolean
  // property?: any
) => {
  if (!exisiting) return true;
  if (!upcoming) return false;
  const condition = ignorebaseTheme
    ? specificityPrecedence.length - 1
    : specificityPrecedence.length;
  for (let index = 0; index < condition; index++) {
    if (
      exisiting[specificityPrecedence[index]] >
      upcoming[specificityPrecedence[index]]
    ) {
      return false;
    } else if (
      exisiting[specificityPrecedence[index]] <
      upcoming[specificityPrecedence[index]]
    ) {
      return true;
    }
  }
  return true;
};

const shouldResolvePseudoProp = ({
  property,
  state,
  platform,
  colormode,
}: {
  property: keyof IPseudoPropsMap;
  state: IStateProps;
  platform: any;
  colormode: any;
}) => {
  if (pseudoPropsMap[property].dependentOn === 'platform') {
    return property === `_${platform}`;
  } else if (pseudoPropsMap[property].dependentOn === 'colormode') {
    return property === `_${colormode}`;
  } else if (pseudoPropsMap[property].dependentOn === 'state') {
    // @ts-ignore
    return state[pseudoPropsMap[property].respondTo];
  } else if (pseudoPropsMap[property].dependentOn === null) {
    return true;
  } else {
    return false;
  }
};

const simplifyProps = (
  {
    props,
    colormode,
    platform,
    state,
    currentSpecificity,
    previouslyFlattenProps,
    cascadePseudoProps,
  }: any,
  flattenProps: any = {},
  specificityMap: any = {},
  priority: number
) => {
  const mergePsuedoProps = (property: string, propertySpecity: object) => {
    if (compareSpecificity(specificityMap[property], propertySpecity, false)) {
      if (process.env.NODE_ENV === 'development' && props.debug) {
        /* eslint-disable-next-line */
        console.log(
          `%c ${property}`,
          'color: #818cf8;',
          'updated as internal prop with higher specificity'
        );
      }
      specificityMap[property] = propertySpecity;
      // merging internal props (like, _text, _stack ...)
      flattenProps[property] = merge(
        {},
        flattenProps[property],
        props[property]
      );
    } else {
      if (process.env.NODE_ENV === 'development' && props.debug) {
        /* eslint-disable-next-line */
        console.log(
          `%c ${property}`,
          'color: #818cf8;',
          'updated as internal prop with lower specificity'
        );
      }
      flattenProps[property] = merge(
        {},
        props[property],
        flattenProps[property]
      );
    }
  };
  for (const property in props) {
    // NOTE: the order is important here. Keep in mind while specificity breakpoints.
    const propertySpecity = currentSpecificity
      ? { ...currentSpecificity }
      : {
          ...INITIAL_PROP_SPECIFICITY,
          [SPECIFICITY_20]: priority,
        };

    if (
      // @ts-ignore
      state[pseudoPropsMap[property]?.respondTo] ||
      ['_dark', '_light', '_web', '_ios', '_android', '_important'].includes(
        property
      )
    ) {
      // @ts-ignore
      if (shouldResolvePseudoProp({ property, state, platform, colormode })) {
        // NOTE: Handling (state driven) props like _important, _web, _ios, _android, _dark, _light, _disabled, _focus, _focusVisible, _hover, _pressed, _readOnly, _invalid, .... Only when they are true.
        if (process.env.NODE_ENV === 'development' && props.debug) {
          /* eslint-disable-next-line */
          console.log(
            `%c ${property}`,
            'color: #818cf8;',
            'recursively resolving'
          );
        }
        // @ts-ignore
        propertySpecity[pseudoPropsMap[property].priority]++;

        simplifyProps(
          {
            props: props[property],
            colormode,
            platform,
            state,
            currentSpecificity: propertySpecity,
            previouslyFlattenProps: previouslyFlattenProps,
            cascadePseudoProps,
          },
          flattenProps,
          specificityMap,
          priority
        );
      }
      // @ts-ignore
    } else if (pseudoPropsMap[property] === undefined) {
      if (property.startsWith('_')) {
        // NOTE: Handling (internal) props like _text, _stack, ....
        mergePsuedoProps(property, propertySpecity);
      } else {
        if (
          compareSpecificity(specificityMap[property], propertySpecity, false)
        ) {
          if (process.env.NODE_ENV === 'development' && props.debug) {
            /* eslint-disable-next-line */
            console.log(
              `%c ${property}`,
              'color: #818cf8;',
              'updated as simple prop'
            );
          }
          specificityMap[property] = propertySpecity;
          // replacing simple props (like, p, m, bg, color, ...)
          flattenProps[property] = props[property];
        } else {
          if (process.env.NODE_ENV === 'development' && props.debug) {
            /* eslint-disable-next-line */
            console.log(`%c ${property}`, 'color: #818cf8;', 'ignored');
          }
        }
      }
    } else {
      // Can delete unused props
      if (!cascadePseudoProps) {
        delete flattenProps[property];
        if (process.env.NODE_ENV === 'development' && props.debug) {
          /* eslint-disable-next-line */
          console.log(`%c ${property}`, 'color: #818cf8;', 'deleted');
        }
      } else {
        if (process.env.NODE_ENV === 'development' && props.debug) {
          /* eslint-disable-next-line */
          console.log(`%c ${property}`, 'color: #818cf8;', 'cascaded');
        }
        mergePsuedoProps(property, propertySpecity);
      }
    }
  }
};

export const propsFlattener = (
  {
    props,
    colormode,
    platform,
    state,
    currentSpecificityMap,
    previouslyFlattenProps,
    cascadePseudoProps,
  }: any,
  priority: number
) => {
  const flattenProps: any = {};

  for (const property in props) {
    if (
      // @ts-ignore
      state[pseudoPropsMap[property]?.respondTo] === undefined &&
      property.startsWith('_')
    ) {
      flattenProps[property] = previouslyFlattenProps[property];
    }
  }

  const specificityMap = currentSpecificityMap || {};

  simplifyProps(
    {
      props,
      colormode,
      platform,
      state,
      currentSpecificityMap,
      previouslyFlattenProps,
      cascadePseudoProps,
    },
    flattenProps,
    specificityMap,
    priority
  );

  return [flattenProps, specificityMap];
};

export const callPropsFlattener = (
  targetProps = {},
  latestSpecifictyMap = {},
  specificity = 1,
  cleanIncomingProps: any,
  colorModeProps: any,
  state: any,
  flattenProps: any,
  config?: any
): any => {
  return propsFlattener(
    {
      props:
        process.env.NODE_ENV === 'development' && cleanIncomingProps.debug
          ? { ...targetProps, debug: true }
          : targetProps,
      //TODO: build-time
      platform: config.platform,
      // platform: Platform.OS,
      colormode: colorModeProps.colorMode,
      state: state || {},
      currentSpecificityMap: latestSpecifictyMap,
      previouslyFlattenProps: flattenProps || {},
      cascadePseudoProps: config?.cascadePseudoProps,
      name: config?.name,
    },
    specificity
  );
};

export const resolvePropsToStyle = (
  styledSystemProps: any,
  propStyle: any,
  theme: any,
  platform: any,
  debug: any,
  currentBreakpoint: any,
  strictMode: any,
  getResponsiveStyles?: any,
  INTERNAL_themeStyle?: any
) => {
  const {
    unResolvedProps,
    styleFromProps,
    restDefaultProps,
    dataSet,
  } = getStyleAndFilteredProps({
    styledSystemProps,
    theme,
    debug,
    currentBreakpoint,
    strictMode,
    getResponsiveStyles,
    platform,
  });

  // console.log(
  //   StyleSheet.flatten([INTERNAL_themeStyle, styleSheet.box, propStyle]),
  //   '3333 style system props'
  // );
  if (propStyle) {
    return {
      style: [INTERNAL_themeStyle, styleFromProps, propStyle],
      styleFromProps,
      unResolvedProps,
      restDefaultProps,

      dataSet,
    };
  } else {
    return {
      style: [INTERNAL_themeStyle, styleFromProps],
      styleFromProps,
      unResolvedProps,
      restDefaultProps,

      dataSet,
    };
  }
};

export const resolveValueWithBreakpoint = (
  values: any,
  breakpointTheme: any,
  currentBreakpoint: number,
  property: any
) => {
  if (hasValidBreakpointFormat(values, breakpointTheme, property)) {
    // Check the last valid breakpoint value from all values
    // If current breakpoint is `md` and we have `base` then `lg`, then last value will be taken(`base` in this case)
    return findLastValidBreakpoint(values, breakpointTheme, currentBreakpoint);
  } else {
    return values;
  }
};
