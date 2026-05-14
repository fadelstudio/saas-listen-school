export interface CreateAnnouncementInput {
  title: string;
  description?: string;
  imageUrl?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
}

export interface UpdateAnnouncementInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
}
