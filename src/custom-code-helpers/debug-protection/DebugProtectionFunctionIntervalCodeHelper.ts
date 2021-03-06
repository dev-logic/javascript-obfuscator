import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import { TIdentifierNamesGeneratorFactory } from '../../types/container/generators/TIdentifierNamesGeneratorFactory';
import { TStatement } from '../../types/node/TStatement';

import { ICustomCodeHelperFormatter } from '../../interfaces/custom-code-helpers/ICustomCodeHelperFormatter';
import { ICustomCodeHelperObfuscator } from '../../interfaces/custom-code-helpers/ICustomCodeHelperObfuscator';
import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';

import { ObfuscationTarget } from '../../enums/ObfuscationTarget';

import { initializable } from '../../decorators/Initializable';

import { DebugProtectionFunctionIntervalTemplate } from './templates/debug-protection-function-interval/DebugProtectionFunctionIntervalTemplate';
import { GlobalVariableNoEvalTemplate } from '../common/templates/GlobalVariableNoEvalTemplate';

import { AbstractCustomCodeHelper } from '../AbstractCustomCodeHelper';
import { NodeUtils } from '../../node/NodeUtils';

@injectable()
export class DebugProtectionFunctionIntervalCodeHelper extends AbstractCustomCodeHelper {
    /**
     * @type {string}
     */
    @initializable()
    private debugProtectionFunctionName!: string;

    /**
     * @type {number}
     */
    @initializable()
    private debugProtectionInterval!: number;

    /**
     * @param {TIdentifierNamesGeneratorFactory} identifierNamesGeneratorFactory
     * @param {ICustomCodeHelperFormatter} customCodeHelperFormatter
     * @param {ICustomCodeHelperObfuscator} customCodeHelperObfuscator
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    public constructor (
        @inject(ServiceIdentifiers.Factory__IIdentifierNamesGenerator)
            identifierNamesGeneratorFactory: TIdentifierNamesGeneratorFactory,
        @inject(ServiceIdentifiers.ICustomCodeHelperFormatter) customCodeHelperFormatter: ICustomCodeHelperFormatter,
        @inject(ServiceIdentifiers.ICustomCodeHelperObfuscator) customCodeHelperObfuscator: ICustomCodeHelperObfuscator,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(
            identifierNamesGeneratorFactory,
            customCodeHelperFormatter,
            customCodeHelperObfuscator,
            randomGenerator,
            options
        );
    }

    /**
     * @param {string} debugProtectionFunctionName
     * @param {number} debugProtectionInterval
     */
    public initialize (debugProtectionFunctionName: string, debugProtectionInterval: number): void {
        this.debugProtectionFunctionName = debugProtectionFunctionName;
        this.debugProtectionInterval = debugProtectionInterval;
    }

    /**
     * @param {string} codeHelperTemplate
     * @returns {TStatement[]}
     */
    protected getNodeStructure (codeHelperTemplate: string): TStatement[] {
        return NodeUtils.convertCodeToStructure(codeHelperTemplate);
    }

    /**
     * @returns {string}
     */
    protected override getCodeHelperTemplate (): string {
        const globalVariableTemplate: string = this.options.target !== ObfuscationTarget.BrowserNoEval
            ? this.getGlobalVariableTemplate()
            : GlobalVariableNoEvalTemplate();

        return this.customCodeHelperFormatter.formatTemplate(DebugProtectionFunctionIntervalTemplate(), {
            debugProtectionFunctionName: this.debugProtectionFunctionName,
            debugProtectionInterval: this.debugProtectionInterval,
            globalVariableTemplate
        });
    }
}
