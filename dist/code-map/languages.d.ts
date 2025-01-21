import Parser from 'tree-sitter';
import { Query } from 'tree-sitter';
interface LanguageConfig {
    language: any;
    extensions: string[];
    packageName: string;
    queryFile: string;
    parser: Parser;
    query: Query;
}
export declare function getLanguageConfig(filePath: string): Promise<LanguageConfig | undefined>;
export {};
