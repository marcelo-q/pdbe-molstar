import { PluginConfig } from 'Molstar/mol-plugin/config';
import { ControlGroup } from 'Molstar/mol-plugin-ui/controls/common';
import { ToggleSelectionModeButton } from 'Molstar/mol-plugin-ui/structure/selection';
import { DownloadScreenshotControls } from './pdbe-screenshot-controls';
import { SimpleSettingsControl } from 'Molstar/mol-plugin-ui/viewport/simple-settings';
import { ViewportControls } from 'Molstar/mol-plugin-ui/viewport';
import { AutorenewSvg, CameraOutlinedSvg, BuildOutlinedSvg, FullscreenSvg, TuneSvg, CloseSvg } from 'Molstar/mol-plugin-ui/controls/icons';

// Marcelo EDIT
// import { IconButton } from 'Molstar/mol-plugin-ui/controls/common';
// import { jsx as _jsx} from "react/jsx-runtime";


export class PDBeViewportControls extends ViewportControls {
    isBlack(customeState: any): boolean{
        if(customeState && customeState.initParams && customeState.initParams.bgColor){
            const color = customeState.initParams.bgColor;
            if(color.r === 0 && color.g === 0 && color.b === 0) return true;
        }
        return false;
    }

    // Marcelo EDIT
    // icon(icon: React.FC, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, title: string, tstyle?: any, isOn?: boolean): JSX.Element {
    //     if (isOn === void 0) { isOn = true; }
    //     if (tstyle === void 0) { tstyle = { background: 'transparent' }}
    //     return _jsx(IconButton, { svg: icon, toggleState: isOn, onClick: onClick, title: title, style: tstyle });
    // }

    render() {
        const customeState: any = this.plugin.customState;
        let showPDBeLink = false;
        let showControlToggle = true;
        let showControlInfo = true;
        if(customeState && customeState.initParams && customeState.initParams.moleculeId && customeState.initParams.pdbeLink) showPDBeLink = true;
        if(customeState && customeState.initParams && customeState.initParams.superposition) showPDBeLink = false;
        if(customeState && customeState.initParams && customeState.initParams.hideCanvasControls && customeState.initParams.hideCanvasControls.indexOf('controlToggle') > -1) showControlToggle = false;
        if(customeState && customeState.initParams && customeState.initParams.hideCanvasControls && customeState.initParams.hideCanvasControls.indexOf('controlInfo') > -1) showControlInfo = false;
        const bgColor = this.isBlack(customeState) ? '#fff' : '#555';
        const pdbeLink: any = {
            parentStyle: { width: 'auto' },
            containerStyle: { position:'absolute', right: '10px', top: '10px' },
            style: { display: 'inline-block', fontSize: '14px', color: bgColor, borderBottom: 'none', cursor: 'pointer', textDecoration: 'none' },
            pdbeImg: {
                src: 'https://www.ebi.ac.uk/pdbe/entry/static/images/logos/PDBe/logo_T_64.png',
                alt: 'PDBe logo',
                style: { height: '12px', width: '12px', border:0, position: 'absolute', margin: '4px 0 0 -13px' }
            }
        };
        let vwpBtnsTopMargin = { marginTop: '22px' };

        return <>
            { showPDBeLink && <div style={pdbeLink.containerStyle}>
                <a className='msp-pdbe-link' style={pdbeLink.style} target="_blank" href={`https://pdbe.org/${customeState.initParams.moleculeId}`}>
                    <img src={pdbeLink.pdbeImg.src} alt={pdbeLink.pdbeImg.alt} style={pdbeLink.pdbeImg.style} />
                    {customeState.initParams.moleculeId}
                </a>
            </div> }
            <div className={'msp-viewport-controls'} onMouseMove={this.onMouseMove} style={showPDBeLink ? vwpBtnsTopMargin : void 0}>
                <div className='msp-viewport-controls-buttons'>
                    <div>
                        <div className='msp-semi-transparent-background' />
                        {this.icon(AutorenewSvg, this.resetCamera, 'Reset Camera')}
                    </div>
                    <div>
                        <div className='msp-semi-transparent-background' />
                        {this.icon(CameraOutlinedSvg, this.toggleScreenshotExpanded, 'Screenshot / State Snapshot', this.state.isScreenshotExpanded)}
                        {/* {this.icon(CameraOutlinedSvg, this.toggleScreenshotExpanded, 'Screenshot / State Snapshot', {'background': ''}, this.state.isScreenshotExpanded)} */}
                    </div>
                    <div>
                        <div className='msp-semi-transparent-background' />
                        {showControlToggle && this.icon(BuildOutlinedSvg, this.toggleControls, 'Toggle Controls Panel', this.plugin.layout.state.showControls)}
                        {this.plugin.config.get(PluginConfig.Viewport.ShowExpand) && this.icon(FullscreenSvg, this.toggleExpanded, 'Toggle Expanded Viewport', this.plugin.layout.state.isExpanded)}
                        {/* {this.plugin.config.get(PluginConfig.Viewport.ShowExpand) && this.icon(FullscreenSvg, this.toggleExpanded, 'Toggle Expanded Viewport', {'background': ''}, this.plugin.layout.state.isExpanded)} */}
                        {showControlInfo && this.icon(TuneSvg, this.toggleSettingsExpanded, 'Settings / Controls Info', this.state.isSettingsExpanded)}
                    </div>
                    {this.plugin.config.get(PluginConfig.Viewport.ShowSelectionMode) && <div>
                        <div className='msp-semi-transparent-background' />
                        <ToggleSelectionModeButton />
                    </div>}
                </div>
                {this.state.isScreenshotExpanded && <div className='msp-viewport-controls-panel'>
                    <ControlGroup header='Screenshot / State' title='Click to close.' initialExpanded={true} hideExpander={true} hideOffset={true} onHeaderClick={this.toggleScreenshotExpanded}
                        topRightIcon={CloseSvg} noTopMargin childrenClassName='msp-viewport-controls-panel-controls'>
                        <DownloadScreenshotControls close={this.toggleScreenshotExpanded} />
                    </ControlGroup>
                </div>}
                {this.state.isSettingsExpanded && <div className='msp-viewport-controls-panel'>
                    <ControlGroup header='Settings / Controls Info' title='Click to close.' initialExpanded={true} hideExpander={true} hideOffset={true} onHeaderClick={this.toggleSettingsExpanded}
                        topRightIcon={CloseSvg} noTopMargin childrenClassName='msp-viewport-controls-panel-controls'>
                        <SimpleSettingsControl />
                    </ControlGroup>
                </div>}
            </div>
        </>;
    }
}