/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as React from 'react';
import { PluginContext } from 'Molstar/mol-plugin/context';
import { ParameterControls } from 'Molstar/mol-plugin-ui/controls/parameters';
import { PluginUIComponent } from 'Molstar/mol-plugin-ui/base';
import { ScreenshotPreview } from 'Molstar/mol-plugin-ui/controls/screenshot';
import { Button, ToggleButton } from 'Molstar/mol-plugin-ui/controls/common';
import { PluginCommands } from 'Molstar/mol-plugin/commands';
import { useBehavior } from 'Molstar/mol-plugin-ui/hooks/use-behavior';
import { GetAppSvg, CopySvg, CropOrginalSvg, CropSvg, CropFreeSvg } from 'Molstar/mol-plugin-ui/controls/icons';

interface ImageControlsState {
    showPreview: boolean,
    isDisabled: boolean,
    imageData?: string
}

export class DownloadScreenshotControls extends PluginUIComponent<{ close: () => void }, ImageControlsState> {
    state: ImageControlsState = {
        showPreview: true,
        isDisabled: false
    } as ImageControlsState;

    private download = () => {
        this.plugin.helpers.viewportScreenshot?.download();
        this.props.close();
    };

    private copy = async () => {
        try {
            await this.plugin.helpers.viewportScreenshot?.copyToClipboard();
            PluginCommands.Toast.Show(this.plugin, {
                message: 'Copied to clipboard.',
                title: 'Screenshot',
                timeoutMs: 1500
            });
        } catch {
            return this.copyImg();
        }
    };

    private copyImg = async () => {
        const src = await this.plugin.helpers.viewportScreenshot?.getImageDataUri();
        this.setState({ imageData: src });
    };

    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
    }

    componentWillUnmount() {
        this.setState({ imageData: void 0 });
    }

    open = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files![0]) return;
        PluginCommands.State.Snapshots.OpenFile(this.plugin, { file: e.target.files![0] });
    };

    render() {
        const hasClipboardApi = !!(navigator.clipboard as any)?.write;

        return <div>
            {this.state.showPreview && <div className='msp-image-preview'>
                <ScreenshotPreview plugin={this.plugin} />
                <CropControls plugin={this.plugin} />
            </div>}
            <div className='msp-flex-row'>
                {!this.state.imageData && <Button icon={CopySvg} onClick={hasClipboardApi ? this.copy : this.copyImg} disabled={this.state.isDisabled}>Copy</Button>}
                {this.state.imageData && <Button onClick={() => this.setState({ imageData: void 0 })} disabled={this.state.isDisabled}>Clear</Button>}
                <Button icon={GetAppSvg} onClick={this.download} disabled={this.state.isDisabled}>Download</Button>
            </div>
            {this.state.imageData && <div className='msp-row msp-copy-image-wrapper'>
                <div>Right click below + Copy Image</div>
                <img src={this.state.imageData} style={{ width: '100%', height: 32, display: 'block' }} />
            </div>}
            <ScreenshotParams plugin={this.plugin} isDisabled={this.state.isDisabled} />
        </div>;
    }
}

function ScreenshotParams({ plugin, isDisabled }: { plugin: PluginContext, isDisabled: boolean }) {
    const helper = plugin.helpers.viewportScreenshot!;
    const values = useBehavior(helper.behaviors.values);

    return <ParameterControls params={helper.params} values={values} onChangeValues={v => helper.behaviors.values.next(v)} isDisabled={isDisabled} />;
}

function CropControls({ plugin }: { plugin: PluginContext }) {
    const helper = plugin.helpers.viewportScreenshot;
    const cropParams = useBehavior(helper?.behaviors.cropParams!);
    useBehavior(helper?.behaviors.relativeCrop);

    if (!helper) return null;

    return <div style={{ width: '100%', height: '24px', marginTop: '8px' }}>
        <ToggleButton icon={CropOrginalSvg} title='Auto-crop' inline isSelected={cropParams.auto}
            style={{ background: 'transparent', float: 'left', width: 'auto', height: '24px', lineHeight: '24px' }}
            toggle={() => helper.toggleAutocrop()} label={'Auto-crop ' + (cropParams.auto ? 'On' : 'Off')} />

        {!cropParams.auto && <Button icon={CropSvg} title='Crop'
            style={{ background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }}
            onClick={() => helper.autocrop()} />}
        {!cropParams.auto && !helper.isFullFrame && <Button icon={CropFreeSvg} title='Reset Crop'
            style={{ background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }}
            onClick={() => helper.resetCrop()} />}
    </div>;
}