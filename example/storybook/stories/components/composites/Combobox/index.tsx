import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { withKnobs } from '@storybook/addon-knobs';
import Wrapper from './../../Wrapper';
import { UsingComponent } from './UsingComponent';
import { UsingComponentWithRenderItem } from './UsingComponentWithRenderItem';
import { UsingControlledInput } from './UsingControlledInput';

storiesOf('Combobox', module)
  .addDecorator(withKnobs)
  .addDecorator((getStory: any) => <Wrapper>{getStory()}</Wrapper>)
  .add('Basic', () => <UsingComponent />)
  .add('Using render item', () => <UsingComponentWithRenderItem />)
  .add('Using Controlled input', () => <UsingControlledInput />);
