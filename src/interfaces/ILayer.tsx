export interface ILayer {
    name: string,
    defaultStyle: IDefaultStyle,
    resource: IResource,
    attribution: IAttribution
}

export interface IDefaultStyle {
    name: string,
    href: string
}

export interface IResource {
    class: string
    name: string,
    href: string
}

export interface IAttribution {
    logoWidth: number,
    logoHeight: number
}

