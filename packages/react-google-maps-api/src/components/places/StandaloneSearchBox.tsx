/* global google */
import * as React from 'react'
//@ts-ignore
import invariant from 'invariant'

import { unregisterEvents, applyUpdatersToPropsAndRegisterEvents } from '../../utils/helper'

import MapContext from '../../map-context'
import { Bounds } from '../../types'

const eventMap = {
  onPlacesChanged: 'places_changed'
}

const updaterMap = {
  bounds (instance: google.maps.places.SearchBox, bounds: Bounds) {
    instance.setBounds(bounds)
  }
}

interface StandaloneSearchBoxState {
  searchBox?: google.maps.places.SearchBox;
}

interface StandaloneSearchBoxProps {
  bounds?: Bounds;
  options?: google.maps.places.SearchBoxOptions;
  onPlacesChanged?: () => void;
}

class StandaloneSearchBox extends React.PureComponent<StandaloneSearchBoxProps, StandaloneSearchBoxState> {
  static contextType = MapContext

  registeredEvents: google.maps.MapsEventListener[] = []

  containerElement: React.RefObject<HTMLDivElement>;

  state: StandaloneSearchBoxState = {
    searchBox: null
  }

  constructor (props: StandaloneSearchBoxProps, context: React.Context<google.maps.Map>) {
    super(props, context)

    invariant(google.maps.places, 'Did you include "libraries=places" in the URL?')
    this.containerElement = React.createRef()
  }

  componentDidMount = () => {
    const searchBox = new google.maps.places.SearchBox(
      this.containerElement.current.querySelector('input'),
      this.props.options
    )

    this.setState(
      () => ({
        searchBox
      }),
      () => {
        this.registeredEvents = applyUpdatersToPropsAndRegisterEvents({
          updaterMap,
          eventMap,
          prevProps: {},
          nextProps: this.props,
          instance: this.state.searchBox
        })
      }
    )
  }

  componentDidUpdate = (prevProps: StandaloneSearchBoxProps) => {
    unregisterEvents(this.registeredEvents)

    this.registeredEvents = applyUpdatersToPropsAndRegisterEvents({
      updaterMap,
      eventMap,
      prevProps,
      nextProps: this.props,
      instance: this.state.searchBox
    })
  }

  componentWillUnmount = () => {
    unregisterEvents(this.registeredEvents)
  }

  render = () => {
    return <div ref={this.containerElement}>{React.Children.only(this.props.children)}</div>
  }

  getBounds = () => this.state.searchBox.getBounds()

  getPlaces = () => this.state.searchBox.getPlaces()
}

export default StandaloneSearchBox