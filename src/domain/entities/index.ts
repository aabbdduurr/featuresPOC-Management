import {
  Feature as IFeature,
  Group as IGroup,
  Platform as IPlatform,
  FeatureValue,
  FeatureType,
  Rollout,
  Segment,
  SegmentCombination,
} from '../../shared/types';

export class Feature implements IFeature {
  constructor(
    public id: string,
    public description: string,
    public type: FeatureType,
    public value: FeatureValue,
    public segments: Segment[] = [],
    public rollout?: Rollout,
    public groupId?: string
  ) {}

  static create(data: {
    id: string;
    description: string;
    type: FeatureType;
    value: FeatureValue;
    groupId?: string;
  }): Feature {
    return new Feature(
      data.id,
      data.description,
      data.type,
      data.value,
      [],
      undefined,
      data.groupId
    );
  }

  updateValue(newValue: FeatureValue): void {
    if (typeof newValue !== typeof this.value && this.type !== 'string') {
      throw new Error(`Value type mismatch. Expected ${this.type}, got ${typeof newValue}`);
    }
    this.value = newValue;
  }

  addSegment(segment: Segment): void {
    const existingSegment = this.segments.find(
      s => JSON.stringify(s.combo) === JSON.stringify(segment.combo)
    );
    if (existingSegment) {
      throw new Error('Segment with this combination already exists');
    }
    this.segments.push(segment);
  }

  removeSegment(combo: SegmentCombination): boolean {
    const initialLength = this.segments.length;
    this.segments = this.segments.filter(s => JSON.stringify(s.combo) !== JSON.stringify(combo));
    return this.segments.length < initialLength;
  }

  reorderSegments(newOrder: number[]): void {
    if (newOrder.length !== this.segments.length) {
      throw new Error('New order must contain all segment indices');
    }

    const reorderedSegments = newOrder.map(index => {
      if (index < 0 || index >= this.segments.length) {
        throw new Error(`Invalid segment index: ${index}`);
      }
      return this.segments[index];
    });

    this.segments = reorderedSegments;
  }

  hasRollout(): boolean {
    return this.rollout !== undefined && this.rollout !== null;
  }

  getEffectiveValue(segmentMatch?: SegmentCombination): FeatureValue {
    if (segmentMatch) {
      const matchingSegment = this.segments.find(segment =>
        this.segmentMatches(segment.combo, segmentMatch)
      );
      if (matchingSegment) {
        return matchingSegment.rollout
          ? this.applyRollout(matchingSegment.value, matchingSegment.rollout)
          : matchingSegment.value;
      }
    }

    return this.rollout ? this.applyRollout(this.value, this.rollout) : this.value;
  }

  private segmentMatches(combo: SegmentCombination, userSegment: SegmentCombination): boolean {
    for (const [key, values] of Object.entries(combo)) {
      const userValues = userSegment[key];
      if (!userValues || !Array.isArray(values)) return false;

      const hasMatch = values.some((value: string) => {
        if (value.startsWith('!')) {
          const excludeValue = value.slice(1);
          return !userValues.includes(excludeValue);
        } else {
          return userValues.includes(value);
        }
      });

      if (!hasMatch) return false;
    }
    return true;
  }

  private applyRollout(primaryValue: FeatureValue, rollout: Rollout): FeatureValue {
    const random = Math.random() * 100;
    return random < rollout.percentage ? primaryValue : rollout.secondaryValue;
  }
}

export class Group implements IGroup {
  constructor(
    public id: string,
    public description: string,
    public features: Feature[] = []
  ) {}

  static create(data: { id: string; description: string }): Group {
    return new Group(data.id, data.description);
  }

  addFeature(feature: Feature): void {
    const existingFeature = this.features.find(f => f.id === feature.id);
    if (existingFeature) {
      throw new Error(`Feature with id '${feature.id}' already exists in group`);
    }
    feature.groupId = this.id;
    this.features.push(feature);
  }

  removeFeature(featureId: string): boolean {
    const initialLength = this.features.length;
    this.features = this.features.filter(f => f.id !== featureId);
    return this.features.length < initialLength;
  }

  getFeature(featureId: string): Feature | undefined {
    return this.features.find(f => f.id === featureId);
  }

  getFeatureCount(): number {
    return this.features.length;
  }
}

export class Platform implements IPlatform {
  constructor(
    public id: string,
    public name: string,
    public groups: Group[] = []
  ) {}

  static create(data: { id: string; name: string }): Platform {
    return new Platform(data.id, data.name);
  }

  addGroup(group: Group): void {
    const existingGroup = this.groups.find(g => g.id === group.id);
    if (existingGroup) {
      throw new Error(`Group with id '${group.id}' already exists in platform`);
    }
    this.groups.push(group);
  }

  removeGroup(groupId: string): boolean {
    const initialLength = this.groups.length;
    this.groups = this.groups.filter(g => g.id !== groupId);
    return this.groups.length < initialLength;
  }

  getGroup(groupId: string): Group | undefined {
    return this.groups.find(g => g.id === groupId);
  }

  getFeature(groupId: string, featureId: string): Feature | undefined {
    const group = this.getGroup(groupId);
    return group?.getFeature(featureId);
  }

  getTotalFeatureCount(): number {
    return this.groups.reduce((total, group) => total + group.getFeatureCount(), 0);
  }
}
