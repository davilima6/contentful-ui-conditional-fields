import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DisplayText, Paragraph, Form } from '@contentful/forma-36-react-components';
import { LAYOUT_OVERWRITES } from './constants';
import { unslugify } from './helpers';
import { renderWidget } from './renderWidget';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

class App extends Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    const fields = this.props.sdk.entry.fields;
    const layout = LAYOUT_OVERWRITES[fields.layout?.getValue()] || {};

    this.state = {
      fields: Object.keys(fields).map(fieldId => {
        const field = fields[fieldId];
        const overrides = layout[fieldId] || {};
        return {
          id: field.id,
          type: field.type,
          required: field.required,
          disabled: false, // TODO: fetch from CT API
          omitted: false, // TODO: fetch from CT API
          label: unslugify(field.id), // TODO: fetch from CT API
          value: field.getValue(),
          options: field.validations?.[0]?.in || [],
          ...overrides
        };
      })
    };
  }

  onFieldChangeHandler = fieldId => event => {
    const value = event.target.value;
    this.setState(state => ({
      fields: state.fields.map(field => (field.id === fieldId ? { ...field, value } : field))
    }));

    try {
      this.props.sdk.entry.fields[fieldId].setValue(value);
      this.props.sdk.notifier.success(`Saved "${fieldId}" field successfully`);
    } catch (error) {
      this.props.sdk.notifier.error(`Error saving field "${fieldId}"`);
    }
  };

  render() {
    return (
      <Form className="f36-margin--l">
        <DisplayText>Create a Block</DisplayText>
        <Paragraph>One content type to rule them all.</Paragraph>
        {Object.values(this.state.fields).map(field =>
          renderWidget(field, this.onFieldChangeHandler(field.id))
        )}
      </Form>
    );
  }
}

export { App };
