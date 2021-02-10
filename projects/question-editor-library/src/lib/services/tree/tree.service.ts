import { Injectable } from '@angular/core';
import 'jquery.fancytree';
import * as _ from 'lodash-es';
import { ToasterService } from '../../services/toaster/toaster.service';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  treeCache = {
    nodesModified: {},
    nodes: []
  };
  treeNativeElement: any;

  constructor(private toasterService: ToasterService) { }

  setTreeElement(el) {
    this.treeNativeElement = el;
  }

  // addNode(objectType, data, createType) {
  //   let newNode;
  //   data = data || {};
  //   const selectedNode = this.getActiveNode();
  //   const node: any = {};
  //   node.title = data.name ? (data.name) : 'Untitled ' + objectType.label;
  //   node.tooltip = data.name;
  //   node.objectType = data.contentType || objectType.type;
  //   node.id = data.identifier ? data.identifier : UUID.UUID();
  //   node.root = false;
  //   node.folder = (data.visibility && data.visibility === 'Default') ? false : (objectType.childrenTypes.length > 0);
  //   node.icon = (data.visibility && data.visibility === 'Default') ? 'fa fa-file-o' : objectType.iconClass;
  //   node.metadata = data;
  //   if (node.folder) {
  //     // to check child node should not be created more than the set configlevel
  //     if ((selectedNode.getLevel() >= this.config.editorConfig.rules.levels - 1) && createType === 'child') {
  //       this.toasterService.error('Sorry, this operation is not allowed.');
  //       return;
  //     }
  //     newNode = (createType === 'sibling') ? selectedNode.appendSibling(node) : selectedNode.addChildren(node);
  // tslint:disable-next-line:max-line-length
  //     this.treeCache.nodesModified[node.id] = { isNew: true, root: false, metadata: { mimeType: 'application/vnd.ekstep.content-collection' } };
  //     this.treeCache.nodes.push(node.id);
  //   } else {
  //     newNode = (createType === 'sibling') ? selectedNode.appendSibling(node) : selectedNode.addChildren(node);
  //   }
  //   newNode.setActive();
  //   // selectedNode.sortChildren(null, true);
  //   selectedNode.setExpanded();
  //   $('span.fancytree-title').attr('style', 'width:15em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden');
  //   $(this.treeNativeElement).scrollLeft($('.fancytree-lastsib').width());
  //   $(this.treeNativeElement).scrollTop($('.fancytree-lastsib').height());
  // }

  updateNode(metadata) {
    this.setNodeTitle(metadata.name);
    this.updateTreeNodeMetadata(metadata);
    const activeNode = this.getActiveNode();
    const nodeId = activeNode.data.id;
    if (_.isUndefined(this.treeCache.nodesModified[nodeId])) {
      this.treeCache.nodesModified[nodeId] = { isNew: false, root: true };
    }
    this.treeCache.nodesModified[nodeId].metadata = _.pickBy(metadata, _.identity);  // rethink this
    const attributions = this.treeCache.nodesModified[nodeId].metadata.attributions;
    if (attributions && _.isString(attributions)) {
      this.treeCache.nodesModified[nodeId].metadata.attributions = attributions.split(',');
    }
    this.treeCache.nodesModified[nodeId].metadata.code = nodeId;
  }

  removeNode() {
    const selectedNode = this.getActiveNode();
    selectedNode.remove();
    this.setActiveNode();
  }

  reloadTree(nodes: any) {
    this.getTreeObject().reload(nodes);
    this.setActiveNode();
  }

  updateTreeNodeMetadata(newData) {
    const activeNode = this.getActiveNode();
    activeNode.data.metadata = {...activeNode.data.metadata, ...newData};
    activeNode.title = newData.name;
  }

  setActiveNode(rootNode?) {
    const rootFirstChildNode = this.getFirstChild();
    const firstChild = rootFirstChildNode.getFirstChild();
    if (rootNode) {
      rootFirstChildNode.setActive();
    } else {
      firstChild ? firstChild.setActive() : rootFirstChildNode.setActive();
    }
  }

  setNodeTitle(title) {
    if (!title) { title = 'Untitled'; }
    title = this.removeSpecialChars(title);
    this.getActiveNode().applyPatch({ title }).done((a, b) => {});
    $('span.fancytree-title').attr('style', 'width:15em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden');
  }

  removeSpecialChars(text) {
    if (text) {
      // tslint:disable-next-line:quotemark
      const iChars = "!`~@#$^*+=[]\\\'{}|\"<>%/";
      for (let i = 0; i < text.length; i++) {
        if (iChars.indexOf(text.charAt(i)) !== -1) {
          this.toasterService.error('Special character "' + text.charAt(i) + '" is not allowed');
        }
      }
      // tslint:disable-next-line:max-line-length
      text = text.replace(/[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\uFB50-\uFDFF\u0980-\u09FF\u0900-\u097F\u0D00-\u0D7F\u0A80-\u0AFF\u0C80-\u0CFF\u0B00-\u0B7F\u0A00-\u0A7F\u0B80-\u0BFF\u0C00-\u0C7F\w:&_\-.(\),\/\s]|[/]/g, '');
      return text;
    }
  }

  replaceNodeId(identifiers) {
    this.getTreeObject().visit((node) => {
      if (identifiers[node.data.id]) {
        node.data.id = identifiers[node.data.id];
      }
    });
  }

  clearTreeCache(node?) {
    if (node) {
      delete this.treeCache.nodesModified[node.id];
      _.remove(this.treeCache.nodes, val => val === node.id);
    } else {
      this.treeCache.nodesModified = {};
      this.treeCache.nodes = [];
    }
  }

  getTreeObject() {
    return $(this.treeNativeElement).fancytree('getTree');
  }

  getActiveNode() {
    return this.getTreeObject().getActiveNode();
  }

  getFirstChild() {
    return $(this.treeNativeElement).fancytree('getRootNode').getFirstChild();
  }

}
